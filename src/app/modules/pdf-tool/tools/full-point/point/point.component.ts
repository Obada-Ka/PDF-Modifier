import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BordersValues } from '../../../models/borders';
import { HtmlEventsService } from '../../../services/html-events.service';
import { ToolsEventsService } from '../../../services/tools-events.service';
import { DraggingShapes } from '../../../shapes-actions/drag/dragging-shapes';
import { StandardPointComponent } from '../../shared-tools/standard-point/standard-point.component';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.css']
})
export class PointComponent implements OnInit, AfterViewInit, OnDestroy {
  destroyComponent: Subject<boolean> = new Subject<boolean>();
  @ViewChild('pointContainer', {read: ViewContainerRef}) pointContainer: ViewContainerRef;
  point: ComponentRef<StandardPointComponent>;
  cmpRef: ComponentRef<PointComponent>;
  valuesBackgroundColor = '#ff0f0f';
  destroy = false;
  activatePoint = false;
  isScalled = false;
  hide = true;
  pointNumberId;
  optionDraw: any;
  initialEvent;
  dargMaskId;
  pointNumber;
  scaleValueforTool = 1;
  workingPage;
  startEndX: number;
  startEndY: number;
  offsetX: any = 0;
  offsetY: any = 0;
  MypagePfHeight: number;
  MypagePfWidth: number;
  MypagePfOffsetLeft: number;
  MypagePfOffsetTop: number;
  exactPos: CustomPosition[] = [{
    offsetX: 0,
    offsetY: 0,
    endX: 0,
    endY: 0
  }];
  containerPosition = {
    x : 0, y : 0
  };
  holderExistPoint: any;
  existPointValues: any;
  specificPage = false;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private toolManagement: ToolsEventsService,
    private convertToHtml: HtmlEventsService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // this.listeningEvents();
    this.checkCompnentStatus();
    this.getNewColorSpan();
    this.getParentZoomingValue();
    setTimeout(() => {
      this.drawIfExist(this.existPointValues);
    });
  }

  ngAfterViewInit(): void {
    if (!this.existPointValues) {

      this.mouseDown(this.initialEvent);
      return;
    }
  }

  drawIfExist(data): void {
    if (!data) {
      return;
    }
    if (data.differentSelectDrawPages) {
      this.exactPos[0].offsetX = data.data[0].value;
      this.exactPos[0].offsetY = data.data[1].value;
      this.toolManagement.emitNewPoint({
        component: this.point,
        pageNumber: data.pageNumber,
        existShape: true,
        differentSelectDrawPages: true
      });
      this.activatePoint = false;
      return;
    }
    this.specificPage = data.specificPage;
    const iframe = document.getElementsByTagName('iframe')[0];
    this.holderExistPoint = JSON.parse(JSON.stringify(this.existPointValues));
    const pfX = iframe.contentWindow.document.querySelectorAll('.page')[data.pageNumber - 1] as any;
    this.startEndX = data.X1;
    this.startEndY = data.Y1;
    this.workingPage = data.pageNumber;
    this.drawPoint();
    this.offsetX = data.X1 - (pfX.clientLeft + (pfX.getBoundingClientRect().left > 0 ? pfX.getBoundingClientRect().left : 0));
          /* iframe.contentWindow.document.querySelectorAll('.page')[this.workingPage - 1] as any).offsetHeight
      * (this.workingPage - 1) */
    this.offsetY = Math.abs(data.Y1 + iframe.contentWindow.document.querySelectorAll('.page')[this.workingPage - 1].clientTop -
      iframe.contentWindow.document.querySelectorAll('.page')[this.workingPage - 1].getBoundingClientRect().top)
      + Math.round(iframe.contentWindow.document.querySelectorAll('.page')[this.workingPage - 1].clientTop / 2) + 1;
    this.containerPosition.x = this.offsetX;
    this.containerPosition.y = this.offsetY;
    this.exactPos[0].endX = data.X1,
    this.exactPos[0].endY = data.Y1 + 15;
    this.updateExactPosOffset({x: this.offsetX, y: this.offsetY});
    this.getLengthWidth();
    this.point.instance.pointDraw(this.startEndX, this.startEndY);
    this.toolManagement.emitNewPoint({
      component: this.point,
      pageNumber: this.workingPage,
      existShape: true
    });
    this.activatePoint = false;
  }

  private drawPoint(): void {
    const factory = this.componentFactoryResolver.resolveComponentFactory(StandardPointComponent);
    const ref = this.pointContainer.createComponent(factory);
    this.point = ref;
    let id;
    id = new Date().getMilliseconds();
    ref.instance.pointNumberId = 'draw_point_' + id;
    ref.instance.exactPos = this.exactPos;
    ref.changeDetectorRef.detectChanges();
    if (this.existPointValues) {
      return;
    }
    this.point.instance.pointDraw(this.startEndX, this.startEndY);

  }

  listeningEvents(): void {
    window.addEventListener('message', (event) => {
      this.setEvents(event);
    }, false);
  }

  setEvents(event): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    if (event.data.type === 'webpackOk' || event.data.event) {
      return;
    }
    if (event.data.action === 'mouseDown'/*  || event.data.action === 'mouseMoved' */) {
      // disable mouseDown if user click in another page
      if (this.workingPage && (this.workingPage !== event.data.e.Page_Number)) {
        return;
      }
      /* if (event.data.e.Y > iframe.contentWindow.document.getElementById('viewerContainer').scrollTop) {
        return;
      } */
      this.mouseDown(event.data.e);
    }
  }

  checkCompnentStatus(): void {
    this.toolManagement.deleteShape
    .pipe(takeUntil(this.destroyComponent))
    .subscribe(
      (res) => {
        if (this.destroy) {
          this.cmpRef.destroy();
        }
      }
    );
  }

  mouseDown(event: CustomMouseEvent): void {
    const coordX = event.X;
    const coordY = event.Y;
    if (!this.activatePoint) {
      return;
    }
    this.workingPage = event.Page_Number;
    this.startDrawingPoint(coordX, coordY, event);
    this.updateExactPosOffset({x: this.offsetX, y: this.offsetY});
    this.getLengthWidth();
    this.activatePoint = false;
    this.toolManagement.emitNewPoint({
      component: this.point,
      pageNumber: this.workingPage
    });

  }

  startDrawingPoint(coordX, coordY, event): void {
    const iframe  = document.getElementsByTagName('iframe')[0];
    this.startEndX = coordX;
    this.startEndY = coordY;
    this.drawPoint();
    this.offsetX = event.startX;
    this.offsetY = event.startY;
    this.containerPosition.x = this.offsetX;
    this.containerPosition.y = this.offsetY /* + iframe.offsetTop */;
    this.exactPos[0].endX = coordX,
    this.exactPos[0].endY = coordY + 15;
  }

  getNewColorSpan(): void {
    this.toolManagement.getNewShapeColor()
    .pipe(takeUntil(this.destroyComponent))
    .subscribe(
      (res) => {
        this.valuesBackgroundColor = res.color;
        this.cd.detectChanges();
      });
  }

  getLengthWidth(): void {
    const frame = document.getElementsByTagName('iframe')[0];
    const actionDragging = new DraggingShapes();
    // workingPage
    const result = actionDragging.getLengthWidth(frame, this.workingPage, this.specificPage);
    this.MypagePfHeight = result.MypagePfHeight;
    this.MypagePfWidth = result.MypagePfWidth;
    this.MypagePfOffsetLeft = result.MypagePfOffsetLeft;
    // OffsetTop for class('.page') and the border with 9px
    this.MypagePfOffsetTop =  result.MypagePfOffsetTop +
    (this.specificPage ? 10 : frame.contentWindow.document.getElementById('viewerContainer').scrollTop) +
    frame.offsetTop - frame.contentWindow.document.querySelectorAll('.page')[0].clientTop
    ;
  }

  getParentZoomingValue(): void {
    this.convertToHtml.zoomParentEvent
    .pipe(takeUntil(this.destroyComponent))
    .subscribe((zoomValue) => {
      this.scaleValueforTool = zoomValue;
      this.isScalled = true;
      this.cd.detectChanges();
    });
  }

  // dragging Line

  dragStarted($event): void {
    // no need to customize DraggingMask
    const iframe = document.getElementsByTagName('iframe')[0];
    const pages = iframe.contentWindow.document.querySelectorAll('.page');
    if (!this.isScalled || !pages[this.workingPage - 1]) {
      return;
    }
    const page = (pages[this.workingPage - 1] as any);
    const dragMask = document.getElementById('drag-mask-point-' + this.pointNumber);
    dragMask.style.height = page.offsetHeight + 'px';
    dragMask.style.top = page.getBoundingClientRect().top + 'px';
  }

  draggingShape($event): void {
    this.hide = false;
  }

  dragEnded($event): void {
    this.hide = true;
    this.cd.detectChanges();
  }

  updateExactPosOffset(position, displacement = null): void{
    const iframe = document.getElementsByTagName('iframe')[0];
    // workingPage
    let correctY = 0;
    const pfX = iframe.contentWindow.document.querySelectorAll('.page')[this.workingPage - 1] as any;
    correctY = pfX.clientHeight - pfX.clientTop;
    const correctX = pfX.clientLeft;
    //  - correctingX
    this.exactPos[0].offsetX =  Number(((position.x > 0 ? position.x : 0) * 0.264583333).toFixed(1));
    //  + correctingY
    if (correctY < position.y) {
      correctY += position.y - correctY;
    }
    this.exactPos[0].offsetY =  Number(((correctY - position.y) * 0.264583333).toFixed(1));
    this.toolManagement.emitCoordXY(this.exactPos, this.workingPage);

  }

  changeExacPos($event): void {
    const MaxMinXY = {
      x: this.startEndX,
      y: this.startEndY
    };
    const actionDragging = new DraggingShapes();
    // tslint:disable-next-line:prefer-const
    let allValues: BordersValues = {
      MypagePfWidth: this.MypagePfWidth,
      MypagePfOffsetLeft: this.MypagePfOffsetLeft,
      MypagePfHeight: this.MypagePfHeight,
      MypagePfOffsetTop: this.MypagePfOffsetTop,
      eventXHolder: $event.x,
      eventYHolder: $event.y,
      offsetXHolder:  this.offsetX + $event.x,
      offsetYHolder:  this.offsetY + $event.y,
      topBorderPointy: MaxMinXY.y - this.MypagePfOffsetTop + $event.y,
      rightBorderPointx: MaxMinXY.x - this.MypagePfOffsetLeft + $event.x,
      bottomBorderPointy: MaxMinXY.y - this.MypagePfOffsetTop + $event.y,
      leftBorderPointx: MaxMinXY.x - this.MypagePfOffsetLeft + $event.x,
      containerPosition: this.containerPosition,
      checkBorder: false
    };
    const result = actionDragging.checkBordersLine(allValues);
    if (result.checkBorder) {
      this.containerPosition = {
        x: result.containerPosition.x,
        y: result.containerPosition.y
      };
    }
    const iframe = document.getElementsByTagName('iframe')[0];
    this.updateExactPosOffset({x: result.offsetXHolder, y: result.offsetYHolder
       /* + (iframe.contentWindow.document.querySelector('.page').getBoundingClientRect().height - this.MypagePfHeight) +
       iframe.contentWindow.document.querySelector('.page').clientTop - 2 */
      }, $event);
  }

  ngOnDestroy(): void {
    this.destroyComponent.next();
    this.destroyComponent.unsubscribe();
  }

}

interface CustomPosition {
  offsetX: number;
  offsetY: number;
  endX: number;
  endY: number;
}

interface CustomMouseEvent {
  X: number;
  Y: number;
  startX?: number;
  startY?: number;
  Page_Number: number;
}
