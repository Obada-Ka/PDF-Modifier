import { Component, ComponentFactoryResolver, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HtmlEventsService } from '../../services/html-events.service';
import { ToolsEventsService } from '../../services/tools-events.service';
import { RectangleComponent } from './rectangle/rectangle.component';

@Component({
  selector: 'app-manage-rectangles',
  templateUrl: './manage-rectangles.component.html',
  styleUrls: ['./manage-rectangles.component.css']
})
export class ManageRectanglesComponent implements OnInit, OnChanges, OnDestroy {
  destroy: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-input-rename
  @ViewChild('divRectanglesContainer', {read: ViewContainerRef}) divRectanglesContainer: ViewContainerRef;
  // tslint:disable-next-line:no-input-rename
  @Input('eventDataPassed') eventDataPassed: any;
  rectanglesNumbers = 1;
  rectangles: any = [];
  optionDraw: any;
  activateDrawing = false;
  status = false;
  eventData: any;
  scaleValueforTool = 1;
  isScalled = false;
  existRectvalues;
  pageNumber: any;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private toolManagement: ToolsEventsService,
    private convertToHtml: HtmlEventsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.eventDataPassed) {
      if (!this.eventDataPassed) {
        return;
      }
      if (this.eventDataPassed.data.type === 'webpackOk') {
        return ;
      }

      if ( this.eventDataPassed.data.action === 'mouseDown' && !this.status) {
        this.mouseDown(this.eventDataPassed.data.e);
        return;
      }
      this.toolManagement.emitEventDataChild(this.eventDataPassed);

    }
  }

  ngOnInit(): void {
    this.checkToolStatus();
    this.checkRectangleStatus();
    // this.listeningEvents();
    this.getNewRectangle();
    this.getModifiedRectangle();
    this.getParentZoomingValue();
    this.getPreviousData();
  }

  private drawRectangle(): void {
    const factory = this.componentFactoryResolver.resolveComponentFactory(RectangleComponent);
    const ref: any = this.divRectanglesContainer.createComponent(factory);
    this.rectangles.push(ref);
    this.rectanglesNumbers = this.rectangles.length;
    ref.instance.rectangleId = 'rectangle_' + this.rectanglesNumbers;
    ref.instance.optionDraw = this.optionDraw;
    ref.instance.RectanglNumber = this.rectanglesNumbers;
    ref.instance.dargMaskId = 'drag-mask-rectangle-' + this.rectanglesNumbers;
    ref.instance.scaleValueforTool = this.scaleValueforTool;
    ref.instance.isScalled = this.isScalled;
    this.activateDrawing = false;
    if (this.existRectvalues) {
      ref.instance.existRectvalues = this.existRectvalues;
      this.existRectvalues = null;
      this.status = false;
      return;
    }
    ref.instance.initialEvent = this.eventData;
    ref.instance.activateRectangle = true;

  }

  checkToolStatus(): void{
    this.toolManagement.getnewTool()
    .pipe(takeUntil(this.destroy))
    .subscribe(
      (key) => {
        if (key.tool === this.toolManagement.RECTANGLE_TOOL_KEY && !key.editMode) {
          this.activateDrawing = true;
          this.optionDraw = key.tool;
        } else {
          this.activateDrawing = false;
          this.status = false;
        }
      }
    );
  }

  checkRectangleStatus(): void {
    this.toolManagement.deleteShape
    .pipe(takeUntil(this.destroy))
    .subscribe(
      (res) => {
        if (res.shape_type === 'Rectangle') {

          this.rectangles.splice(res.shape_index, 1);
          // this.exact_pos.splice(res.shape_index, 1)
          this.rectanglesNumbers = this.rectangles.length;
          if (!this.rectangles.length) {
            this.rectanglesNumbers = 1;
          }
        }
      });
  }

  getNewRectangle(): void {
    this.toolManagement.drawnRectangle
    .pipe(takeUntil(this.destroy))
    .subscribe((res) => {
      const iframe = document.getElementsByTagName('iframe')[0];
      if (iframe.contentWindow.document.querySelector('.tool')) {
        iframe.contentWindow.document.querySelectorAll('.edit-option').forEach((rectangle) =>
        (rectangle as any).style.display = 'none');
      }
        // deactivate drawing in the current polygonal
      this.activateDrawing = false;
      this.toolManagement.emitNewShape({
          type: 'Rectangle',
          component: this.rectangles[this.rectangles.length - 1],
          length: res.length,
          pageNumber: res.pageNumber,
          existShape: res.existShape ? res.existShape : null,
          editMode: false,
          differentSelectDrawPages: res.differentSelectDrawPages ? res.differentSelectDrawPages : false
        });

      this.rectangles[this.rectangles.length - 1].instance.activateRectangle = false;
      if (res.existShape) {
          return;
        }
      this.activateDrawing = true;
      this.status = false;
      this.toolManagement.emitCoordXY(
          this.rectangles[this.rectangles.length - 1].instance.exactPos,
          this.pageNumber
        );

      });
  }

  getModifiedRectangle(): void {
    this.toolManagement.editDrawnRectangle
    .pipe(takeUntil(this.destroy))
    .subscribe(
      (res) => {
        const rectangleIndex = this.rectangles.findIndex(rectangle => rectangle.instance.rectangleId === res.rectangleId);
        const editRectangle = this.rectangles[rectangleIndex];

        this.toolManagement.emitNewShape({
          type: 'Rectangle',
          component: editRectangle,
          length: res.length,
          pageNumber: res.pageNumber,
          editMode: true
        });
        editRectangle.instance.activateRectangle = false;
        editRectangle.instance.activate_dragging = true;
        editRectangle.instance.editMode = false;
        this.pageNumber = res.pageNumber;
        this.toolManagement.emitCoordXY(editRectangle.instance.exactPos, this.pageNumber);
        this.toolManagement.emitNewTool({tool: 'none_selected', editMode: false});
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
    this.toolManagement.getExistenceShape().pipe(takeUntil(this.destroy))
    .subscribe((res) => {
      if (this.toolManagement.RECTANGLE_TOOL_KEY !== res.type ) {
        return;
      }
      this.optionDraw = res.optionDraw;
      this.existRectvalues = !res.differentSelectDrawPages ? this.prepareCoord(res) : res;
      this.existRectvalues = Object.assign(this.existRectvalues, {
        pageNumber: res.pageNumber,
        specificPage: res.specificPage,
        differentSelectDrawPages: res.differentSelectDrawPages
      });
      this.drawRectangle();
    });
  }

  prepareCoord(data): any {
    const PagePF = 'page' + data.pageNumber;
    const iframe = document.getElementsByTagName('iframe')[0];
    let pfX = iframe.contentWindow.document.querySelectorAll('.page')[data.pageNumber - 1] as any;
    if (data.specificPage) {
      pfX = iframe.contentWindow.document.querySelectorAll('.page')[0] as any;
    }
    let correctY = pfX.offsetHeight - pfX.clientTop;
    if (!pfX) {
      pfX = iframe.contentWindow.document.querySelectorAll('.page')[data.pageNumber - 1] as any;
      correctY = pfX.clientHeight;
    }
    return {
      X1 : Math.round((data.data[0].value / 0.264583333) + pfX.clientLeft + (pfX.getBoundingClientRect().left > 0 ?
      pfX.getBoundingClientRect().left : 0)),
      Y1 :  Math.round(pfX.clientTop / 2) + pfX.offsetTop + correctY
        - (data.data[1].value  / 0.264583333)
        - (data.data[3].value  / 0.264583333),
      X2 : ((data.data[0].value  / 0.264583333) + pfX.clientLeft + (pfX.getBoundingClientRect().left > 0 ?
      pfX.getBoundingClientRect().left : 0)) +
            (data.data[2].value / 0.264583333),
      Y2 :  Math.round(pfX.clientTop / 2) + pfX.offsetTop + correctY
        - (data.data[1].value  / 0.264583333)
    };
  }

  listeningEvents(): void {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'webpackOk') {
        return ;
      }
      if ( event.data.action === 'mouseDown') {
        this.mouseDown(event.data.e);
      }
    }, false);
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
      this.drawRectangle();
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.unsubscribe();
  }

}
