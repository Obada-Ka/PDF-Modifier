import { Component, ComponentFactoryResolver, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HtmlEventsService } from '../../services/html-events.service';
import { ToolsEventsService } from '../../services/tools-events.service';
import { LineComponent } from './line/line.component';

@Component({
  selector: 'app-manage-lines',
  templateUrl: './manage-lines.component.html',
  styleUrls: ['./manage-lines.component.css'],
})
export class ManageLinesComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('divLinesContainer', { read: ViewContainerRef })
  divLinesContainer: ViewContainerRef;
  // tslint:disable-next-line:no-input-rename
  @Input('eventDataPassed') eventDataPassed: any;
  destroy: Subject<boolean> = new Subject<boolean>();
  lines = [] ;
  optionDraw: any;
  linesNumber = 1;
  activateDrawing = false;
  status = false;
  eventData: any;
  pageNumber: any;
  scaleValueforTool = 1;
  isScalled = false;
  existLineValues = false;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private toolManagement: ToolsEventsService,
    private convertToHtml: HtmlEventsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.eventDataPassed) {
      if (!this.eventDataPassed) {
        return;
      }
      if (this.eventDataPassed.data.type === 'webpackOk') {
        return;
      }

      if (
        this.eventDataPassed.data.action === 'mouseDown' &&
        this.activateDrawing
      ) {
        this.mouseDown(this.eventDataPassed.data.e);
        return;
      }
      this.toolManagement.emitEventDataChild(this.eventDataPassed.currentValue);
    }
  }

  ngOnInit(): void {
    // this.listeningEvents();
    this.checkToolStatus();
    this.getNewLine();
    this.getParentZoomingValue();
    this.getPreviousData();
  }

  private drawLine(): void {
    const factory =
      this.componentFactoryResolver.resolveComponentFactory(LineComponent);
    const ref: any = this.divLinesContainer.createComponent(factory);
    this.lines.push(ref);
    this.linesNumber = this.lines.length;
    ref.instance.lineNumberId = 'line_' + this.linesNumber;
    ref.instance.optionDraw = this.optionDraw;
    ref.instance.dargMaskId = 'drag-mask-line-' + this.linesNumber;
    ref.instance.lineNumber = this.linesNumber;
    ref.instance.scaleValueforTool = this.scaleValueforTool;
    ref.instance.isScalled = this.isScalled;
    this.activateDrawing = false;
    if (this.existLineValues) {
      ref.instance.existLineValues = this.existLineValues;
      this.existLineValues = null;
      ref.changeDetectorRef.detectChanges();
      return;
    }
    ref.instance.initialEvent = this.eventData;
    ref.instance.activateLine = true;
    ref.changeDetectorRef.detectChanges();
  }

  checkToolStatus(): void {
    this.toolManagement
      .getnewTool()
      .pipe(takeUntil(this.destroy))
      .subscribe((key) => {
        if (key.tool === this.toolManagement.LINE_TOOL_KEY) {
          this.activateDrawing = true;
          this.optionDraw = key.tool;
        } else {
          this.activateDrawing = false;
        }
      });
  }

  checkLinesStatus(): void {
    this.toolManagement.deleteShape
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        if (res.shape_type === 'Line') {
          this.lines.splice(res.shape_index, 1);
          this.linesNumber = this.lines.length;
          if (!this.lines.length) {
            this.linesNumber = 1;
          }
        }
      });
  }

  getNewLine(): void {
    this.toolManagement.drawnLine
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        // deactivate drawing in the current line
        this.activateDrawing = false;
        this.toolManagement.emitNewShape({
          type: 'Line',
          component: this.lines[this.lines.length - 1],
          length: 0,
          pageNumber: res.pageNumber,
          existShape: res.existShape ? res.existShape : null,
          editMode: false,
          differentSelectDrawPages: res.differentSelectDrawPages
            ? res.differentSelectDrawPages
            : false,
        });
        this.lines[this.lines.length - 1].instance.activateLine = false;
        if (res.existShape) {
          return;
        }
        this.pageNumber = res.pageNumber;
        this.toolManagement.emitCoordXY(
          this.lines[this.lines.length - 1].instance.exactPos,
          this.pageNumber
        );
        this.activateDrawing = true;
      });
  }

  getParentZoomingValue(): void {
    this.convertToHtml.zoomParentEvent
      .pipe(takeUntil(this.destroy))
      .subscribe((zoomValue) => {
        this.scaleValueforTool = zoomValue;
        this.isScalled = true;
      });
  }

  getPreviousData(): void {
    // tslint:disable-next-line:prefer-const
    this.toolManagement
      .getExistenceShape()
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        if (this.toolManagement.LINE_TOOL_KEY !== res.type) {
          return;
        }
        this.existLineValues = this.prepareCoord(res);
        this.existLineValues = Object.assign(this.existLineValues, {
          pageNumber: res.pageNumber,
          specificPage: res.specificPage,
        });
        this.drawLine();
      });
  }

  prepareCoord(data): any {
    const iframe = document.getElementsByTagName('iframe')[0];
    const pfX = iframe.contentWindow.document.querySelectorAll('.page')[
      data.pageNumber - 1
    ] as any;
    const correctY = pfX.clientHeight - pfX.clientTop - 2;
    /* iframe.contentWindow.document.querySelectorAll('.page')[0].getBoundingClientRect().top -
    iframe.contentWindow.document.querySelectorAll('.page')[data.pageNumber - 1].clientTop; */
    return {
      X1:
        data.data[0].value / 0.264583333 +
        pfX.clientLeft +
        (pfX.getBoundingClientRect().left > 0
          ? pfX.getBoundingClientRect().left
          : 0),
      // pfX.offsetTop + pfX.clientTop + (((pfX.offsetHeight * 0.264583333) - data.data[1].value) / 0.2645833333)
      Y1:
        pfX.clientTop +
        (data.specificPage ? 9 : pfX.offsetTop) +
        correctY -
        data.data[1].value / 0.264583333,
    };
  }

  mouseDown(event): void {
    if (!this.activateDrawing || isNaN(event.Page_Number)) {
      return;
    }
    this.status = !this.status;
    if (this.status) {
      const iframe = document.getElementsByTagName('iframe')[0];
      event.Y += iframe.contentWindow.document.getElementById('viewerContainer').scrollTop;
      event.X += iframe.contentWindow.document.getElementById('viewerContainer').scrollLeft;
      // event.startY += iframe.contentWindow.document.getElementById('viewerContainer').scrollTop;
      // event.startX += iframe.contentWindow.document.getElementById('viewerContainer').scrollLeft;
      this.pageNumber = event.Page_Number;
      this.eventData = event;
      this.drawLine();
    }
  }

  listeningEvents(): void {
    window.addEventListener(
      'message',
      (event) => {
        if (event.data.type === 'webpackOk') {
          return;
        }
        if (event.data.action === 'mouseDown') {
          this.mouseDown(event.data.e);
        }
      },
      false
    );
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}

