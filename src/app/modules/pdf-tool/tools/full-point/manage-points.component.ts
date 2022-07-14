import { Component, ComponentFactoryResolver, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HtmlEventsService } from '../../services/html-events.service';
import { ToolsEventsService } from '../../services/tools-events.service';
import { PointComponent } from './point/point.component';

@Component({
  selector: 'app-manage-points',
  templateUrl: './manage-points.component.html',
  styleUrls: ['./manage-points.component.css'],
})
export class ManagePointsComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('divPointsContainer', { read: ViewContainerRef })
  divPointsContainer: ViewContainerRef;
  // tslint:disable-next-line:no-input-rename
  @Input('eventDataPassed') eventDataPassed: any;
  destroy: Subject<boolean> = new Subject<boolean>();
  points = [];
  optionDraw: any;
  pointsNumber = 1;
  activateDrawing = false;
  eventData: any;
  scaleValueforTool = 1;
  isScalled = false;
  pageNumber: any;
  existPointValues: any;
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
      // this.toolManagement.emitEventDataChild(this.eventDataPassed.currentValue);
    }
  }

  ngOnInit(): void {
    // this.listeningEvents();
    this.checkToolStatus();
    this.getNewPoint();
    this.getParentZoomingValue();
    this.getPreviousData();
  }

  private drawPoint(): void {
    const factory =
      this.componentFactoryResolver.resolveComponentFactory(PointComponent);
    const ref: any = this.divPointsContainer.createComponent(factory);
    this.points.push(ref);
    this.pointsNumber = this.points.length;
    ref.instance.pointNumberId = 'point_' + this.pointsNumber;
    ref.instance.optionDraw = this.optionDraw;
    ref.instance.dargMaskId = 'drag-mask-point-' + this.pointsNumber;
    ref.instance.pointNumber = this.pointsNumber;
    ref.instance.scaleValueforTool = this.scaleValueforTool;
    ref.instance.isScalled = this.isScalled;
    this.activateDrawing = false;
    if (this.existPointValues) {
      ref.instance.existPointValues = this.existPointValues;
      this.existPointValues = null;
      ref.changeDetectorRef.detectChanges();
      return;
    }
    ref.instance.initialEvent = this.eventData;
    ref.instance.activatePoint = true;
    ref.changeDetectorRef.detectChanges();
  }

  checkToolStatus(): void {
    this.toolManagement
      .getnewTool()
      .pipe(takeUntil(this.destroy))
      .subscribe((key) => {
        if (key.tool === this.toolManagement.POINT_TOOL_KEY) {
          this.activateDrawing = true;
          this.optionDraw = key.tool;
        } else {
          this.activateDrawing = false;
        }
      });
  }

  checkPointsStatus(): void {
    this.toolManagement.deleteShape
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        if (res.shape_type === 'Point') {
          this.points.splice(res.shape_index, 1);
          this.pointsNumber = this.points.length;
          if (!this.points.length) {
            this.pointsNumber = 1;
          }
        }
      });
  }

  getNewPoint(): void {
    this.toolManagement.drawnPoint
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        // deactivate drawing in the current point
        this.activateDrawing = false;
        this.toolManagement.emitNewShape({
          type: 'Point',
          component: this.points[this.points.length - 1],
          length: 0,
          pageNumber: res.pageNumber,
          existShape: res.existShape ? res.existShape : null,
          editMode: false,
          differentSelectDrawPages: res.differentSelectDrawPages
            ? res.differentSelectDrawPages
            : false,
        });
        this.points[this.points.length - 1].instance.activatePoint = false;
        if (res.existShape) {
          return;
        }
        this.pageNumber = res.pageNumber;
        this.toolManagement.emitCoordXY(
          this.points[this.points.length - 1].instance.exactPos,
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
        if (this.toolManagement.POINT_TOOL_KEY !== res.type) {
          return;
        }
        this.existPointValues = this.prepareCoord(res);
        this.existPointValues = Object.assign(this.existPointValues, {
          pageNumber: res.pageNumber,
          specificPage: res.specificPage,
        });
        this.drawPoint();
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
    const iframe = document.getElementsByTagName('iframe')[0];
    event.Y +=
      iframe.contentWindow.document.getElementById('viewerContainer').scrollTop;
    event.X +=
      iframe.contentWindow.document.getElementById(
        'viewerContainer'
      ).scrollLeft;
    //  event.startY +=  iframe.contentWindow.document.getElementById('viewerContainer').scrollTop;
    this.eventData = event;
    this.pageNumber = event.Page_Number;
    this.drawPoint();
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
