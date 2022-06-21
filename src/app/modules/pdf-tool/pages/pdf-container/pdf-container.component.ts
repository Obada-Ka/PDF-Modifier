import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HtmlEventsService } from '../../services/html-events.service';
import { ToolsEventsService } from '../../services/tools-events.service';

@Component({
  selector: 'app-pdf-container',
  templateUrl: './pdf-container.component.html',
  styleUrls: ['./pdf-container.component.css'],
})
export class PdfContainerComponent implements OnInit, OnDestroy {
  @Output() measurements ? = new EventEmitter<any>();
  @Output() highlightedTexts ? = new EventEmitter<any>();
  @Output() fileIsRenderd ? = new EventEmitter<any>();
  // tslint:disable-next-line:no-input-rename
  @Input('file') selectedFileToDrawOn: any;
  // tslint:disable-next-line:no-input-rename
  @Input('configDrawingMode') configDrawingMode;
  destroy: Subject<boolean> = new Subject<boolean>();
  currentFile;
  loader = false;
  uploadOption = false;
  tools: any;
  optionDraw: string;
  showPaints = false;
  toolsMini = false;
  uploadResponse: string | { status: string; message: number };
  error: any;
  progress: any = 0;
  scaleXYvAlue: number;
  previousZoomingValue: any = 0;
  zoomValue = '0';
  pageNumber = '1';
  previousValue = 0;
  scaleXY: string;
  totalPageNumber: any;
  selectedFile;
  newCoordXY: any;
  fileIndex: any;
  section: any;
  field: any;
  repeatTime: any;
  parentSection: any;
  selectedTextValues = [];
  specificPageToShow = false;

  constructor(
    private toolsEventsService: ToolsEventsService,
    private convertToHtml: HtmlEventsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.activateEditDrawing();
    });
    this.getChildPageNumber();
    this.handleWindowZooming();
    this.checkChildZooming();
    this.checkExactCoordData();
    this.checkSelectedText();
    this.onFileChangedPDFJs();
  }

  checkIfDataReceived(): void {
    switch (this.configDrawingMode.mode) {
      case 'Drawing': {
        const notEntered = (element) => {
          return (
            element.value === '' ||
            element.value === null ||
            typeof element.value === 'string'
          );
        };
        if (this.configDrawingMode.data.some(notEntered)) {
          return;
        }
        this.toolsEventsService.emitExistenceShape({
          type: this.configDrawingMode.tool.toolName,
          data: this.configDrawingMode.data,
          pageNumber: this.configDrawingMode.pageNumber
            ? this.configDrawingMode.pageNumber
            : null,
          specificPage: this.specificPageToShow,
          differentSelectDrawPages:
            this.configDrawingMode.differentSelectDrawPages,
          selectMode: false,
        });
        break;
      }
      case 'selectText': {
        this.configDrawingMode.data.forEach((field) => {
          if (!field.value) {
            return;
          }
          this.toolsEventsService.emitPreviousData({
            type: field.key,
            value: field.value,
            pageNumber: '_',
            selectMode: true,
          });
        });
        break;
      }
      case 'Preview': {
        const margins = {
          T: 'marginTop',
          L: 'marginLeft',
          Z: 'transform',
        };
        // tslint:disable-next-line:prefer-const
        let data = {
          marginsZoom: [],
          envelope: {},
        };
        this.configDrawingMode.data.fields.forEach((field) => {
          if (field.value === '' && field.key.split('_')[1] !== 'Z') {
            return;
          }
          data.marginsZoom.push({
            type: margins[field.key.split('_')[1]],
            value:
              field.key.split('_')[1] === 'Z'
                ? 'scale(' +
                  (!field.value ? 100 : field.value) / 100 +
                  ', ' +
                  (!field.value ? 100 : field.value) / 100 +
                  ')'
                : field.value,
          });
        });
        data.envelope = this.configDrawingMode.data.envelope;
        /* if (!data.length) {
          break;
        } */
        this.toolsEventsService.emitPreviewData(data);
        break;
      }
      default: {
        break;
      }
    }
  }

  activateEditDrawing(): void {
    let newTool;
    this.toolsEventsService
      .getnewTool()
      .pipe(takeUntil(this.destroy))
      .subscribe((tool) => {
        newTool = tool.tool;
        if (newTool === 'none_selected') {
          this.optionDraw = null;
          return;
        }
        this.optionDraw = newTool;
        this.cd.detectChanges();
      });
  }

  activateDrawing(option: string): void {
    if (this.optionDraw === option) {
      this.toolsEventsService.emitNewTool({
        tool: 'none_selected',
        editMode: false,
      });
      this.optionDraw = '';
      this.cd.detectChanges();
      return;
    }
    this.optionDraw = option;
    if (this.configDrawingMode.mode !== 'Drawing') {
      this.cd.detectChanges();
      this.toolsEventsService.emitNewTool({
        tool: option,
        editMode: false,
        selectMode: true,
      });
      return;
    }
    this.toolsEventsService.emitNewTool({ tool: option, editMode: false });
    this.cd.detectChanges();
  }

  minimizeElement(): void {
    this.toolsMini = !this.toolsMini;
    this.cd.detectChanges();
  }

  checkDataLoaded($event): void {
    if (!$event.loaded) {
      return;
    }
    const iframe = document.getElementsByTagName('iframe')[0];
    this.uploadOption = true;
    this.showPaints = true;
    this.tools = true;
    this.totalPageNumber = $event.totalPageNumber;
    this.fileIsRenderd.emit(true);
    setTimeout(() => {
      if (
        !this.selectedFileToDrawOn.file.hasOwnProperty(
          'startPage'
        ) /*  || this.selectedFileToDrawOn.file.startPage === 1 */
      ) {
        this.specificPageToShow = false;
        this.checkIfDataReceived();
        return;
      }
      this.specificPageToShow = true;
      this.checkIfDataReceived();
      this.changePage(this.selectedFileToDrawOn.file.startPage - 1);
    });
    this.cd.detectChanges();
  }

  checkExactCoordData(): void {
    this.toolsEventsService
      .getExactCoordXY()
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        if (!res) {
          this.newCoordXY = {
            data: [null, null, null, null],
            pageNumber: null,
          };
          this.measurements.emit(this.newCoordXY);
          return;
        }
        const CoordXY = res.data[0];
        const x = CoordXY.offsetX;
        const y = CoordXY.offsetY;
        const w = CoordXY.width !== null ? CoordXY.width : null;
        const h = CoordXY.height !== null ? CoordXY.height : null;
        this.newCoordXY = {
          data: [x, y, w, h],
          pageNumber: res.pageNumber,
        };
        this.measurements.emit(this.newCoordXY);
      });
  }

  checkSelectedText(): void {
    this.toolsEventsService
      .getAllSelectedTextValue()
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        this.selectedTextValues = [];
        res.forEach((text) => {
          this.selectedTextValues.push({
            key: text.type,
            value: text.value,
          });
        });
        setTimeout(() => {
          this.activateDrawing(this.optionDraw);
        }, 500);
        this.highlightedTexts.emit(this.selectedTextValues);
      });
  }

  onFileChangedPDFJs(): void {
    this.selectedFile = this.selectedFileToDrawOn;
    this.convertToHtml.emitNewFile(1, this.selectedFileToDrawOn);
  }

  // Zooming Pages & Shapes

  zoomInOut(value): void {
    // check if the previous value is between 0.01 and 0.09
    if (
      Math.abs(value) > Math.abs(this.previousValue) &&
      this.previousValue !== 0
    ) {
      value = Math.sign(value) * 0.01;
    }
    this.previousValue = Number(Number(this.previousValue + value).toFixed(2));
    // if the value is more 200 or -200 to go back with only one click
    if (this.previousValue > 2.0 || this.previousValue < -2.0) {
      this.previousValue = this.previousValue - value;
      return;
    }
    this.zooming(this.previousValue);
    if (Math.sign(this.previousValue * 100) === 0) {
      this.zoomValue = '0';
      return;
    }
    this.zoomValue = String((this.previousValue * 100).toFixed(0));
    this.cd.detectChanges();
  }

  zooming(value): void {
    this.scaleXYvAlue = 1;
    this.scaleXYvAlue += value;
    this.convertToHtml.emitParentZoomEvent(this.scaleXYvAlue);
    if (this.scaleXYvAlue === 1) {
      this.scaleXY = 'none';
    } else {
      this.scaleXY =
        'scale(' + this.scaleXYvAlue + ',' + this.scaleXYvAlue + ')';
    }
    this.cd.detectChanges();
    const divContainer = document
      .getElementById('container_pdf')
      .getBoundingClientRect().width;
    if (!divContainer) {
      this.zoomInOut(0.2);
      this.cd.detectChanges();
      return;
    }
  }

  getZoomingValue($event): void {
    const zoomingValue = Number($event.target.value);
    const sendValue = this.checkZoomValue(zoomingValue) / 100;
    this.previousZoomingValue = zoomingValue;
    this.previousValue = sendValue;
    this.zooming(sendValue);
    this.cd.detectChanges();
  }

  checkZoomValue(zoomingValue): number {
    if (zoomingValue > 200 || zoomingValue < -200) {
      zoomingValue = Math.sign(zoomingValue) * 200;
    }
    let sendValue = zoomingValue;
    if (Math.sign(zoomingValue) === 0) {
      sendValue = 0;
    }
    this.cd.detectChanges();
    return sendValue;
  }

  checkChildZooming(): void {
    this.convertToHtml.zoomChildEvent
      .pipe(takeUntil(this.destroy))
      .subscribe((zoomEvent) => {
        this.zoomInOut(zoomEvent);
        this.cd.detectChanges();
      });
  }

  handleWindowZooming(): void {
    window.addEventListener(
      'wheel',
      (event) => {
        if (event.ctrlKey && event.type === 'wheel') {
          event.preventDefault();
        }
      },
      { passive: false }
    );
    window.addEventListener(
      'keydown',
      (event) => {
        const eventCodes = ['NumpadAdd', 'NumpadSubtract', 'Equal', 'Minus'];
        const codeExist = eventCodes.findIndex((code) => code === event.code);
        if (event.ctrlKey && codeExist > -1) {
          event.preventDefault();
        }
      },
      { passive: false }
    );
  }

  // change Pages

  changePage(pageNumber): void {
    let currentPageNumber = Number(this.pageNumber);
    currentPageNumber += pageNumber;
    if (currentPageNumber > this.totalPageNumber || currentPageNumber <= 0) {
      return;
    }
    this.pageNumber = String(currentPageNumber);
    this.cd.detectChanges();
    this.convertToHtml.emitParentNewPage(
      currentPageNumber,
      this.specificPageToShow
    );
  }

  getPageNumber($event): void {
    const pageNumber = Number($event.target.value);
    this.pageNumber = $event.target.value;
    const frame = document.getElementsByTagName('iframe')[0];
    if (pageNumber > this.totalPageNumber || pageNumber <= 0) {
      return;
    }
    this.convertToHtml.emitParentNewPage(pageNumber, this.specificPageToShow);
  }

  getChildPageNumber(): void {
    this.convertToHtml.pageNumberChild
      .pipe(takeUntil(this.destroy))
      .subscribe((pageNumber) => {
        this.pageNumber = String(pageNumber);
        this.cd.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}
