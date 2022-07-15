import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver,
  ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BordersValues } from '../../../models/borders';
import { HtmlEventsService } from '../../../services/html-events.service';
import { ToolsEventsService } from '../../../services/tools-events.service';
import { DraggingShapes } from '../../../shapes-actions/drag/dragging-shapes';
import { StandardLineComponent } from '../../shared-tools/standard-line/standard-line.component';

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css']
})

export class LineComponent implements OnInit, AfterViewInit, OnDestroy {
  destroyComponent: Subject<boolean> = new Subject<boolean>();
  @ViewChild('lineContainer', {read: ViewContainerRef}) lineContainer: ViewContainerRef;
  scaleValueforTool = 1;
  destroy = false;
  cmpRef: ComponentRef<LineComponent>;
  points = [];
  statusLine = false;
  activateLine = false;
  startEndX: number;
  startEndY: number;
  workingPage ;
  lineNumberId;
  dargMaskId;
  LineNumber;
  optionDraw: any;
  containerPosition = {
    x : 0, y : 0
  };
  initialEvent;
  exactPos: CustomPosition[] = [{
    offsetX: 0,
    offsetY: 0,
    endX: 0,
    endY: 0,
    height: 0
  }];
  valuesBackgroundColor = '#ff0f0f';
  offsetX: any = 0;
  offsetY: any = 0;
  line: ComponentRef<StandardLineComponent>;
  MypagePfHeight: number;
  MypagePfWidth: number;
  MypagePfOffsetLeft: number;
  MypagePfOffsetTop: number;
  hide = true;
  toolBarHeight: number;
  lineDisplayed = false;
  isScalled = false;
  existLineValues = false;
  holderExistPoint: any;
  specificPage = false;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private toolManagement: ToolsEventsService,
    private convertToHtml: HtmlEventsService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listeningEvents();
    this.checkCompnentStatus();
    this.getNewColorSpan();
    this.getParentZoomingValue();
    setTimeout(() => {
      this.drawIfExist(this.existLineValues);
    });
  }

  ngAfterViewInit(): void {
    this.mouseDown(this.initialEvent);
  }

  drawIfExist(data): void {
    if (!data) {
      return;
    }
    if (data.differentSelectDrawPages) {
      this.exactPos[0].offsetX = data.data[0].value;
      this.exactPos[0].offsetY = data.data[1].value;
      /* this.toolManagement.emitNewLine({
        component: this.line,
        pageNumber: data.pageNumber,
        existShape: true,
        differentSelectDrawPages: true
      }); */
      this.activateLine = false;
      return;
    }
    this.specificPage = data.specificPage;
    const iframe = document.getElementsByTagName('iframe')[0];
    this.holderExistPoint = JSON.parse(JSON.stringify(this.existLineValues));
    const pfX = iframe.contentWindow.document.querySelectorAll('.page')[data.pageNumber - 1] as any;
    this.startEndX = data.X1;
    this.startEndY = data.Y1;
    this.workingPage = data.pageNumber;
    this.drawLine();
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
    /* this.line.instance.linedraw(this.startEndX, this.startEndY);
    this.toolManagement.emitNewLine({
      component: this.line,
      pageNumber: this.workingPage,
      existShape: true
    }); */
    this.activateLine = false;
  }

  private drawLine(): void {
    const factory = this.componentFactoryResolver.resolveComponentFactory(StandardLineComponent);
    const ref = this.lineContainer.createComponent(factory);
    this.line = ref;
    let id;
    id = new Date().getMilliseconds();
    ref.instance.lineNumberId = 'draw_line_' + id;
    ref.instance.exactPos = this.exactPos;
    ref.changeDetectorRef.detectChanges();

  }

  moveLine(oldx, oldy, coordx, coordy): void {
    this.line.instance.linedraw(oldx, oldy, coordx, coordy, false, 0, false, this.optionDraw);
    const height = this.line.instance.lineLength;
    this.exactPos[0].endX = coordx;
    this.exactPos[0].endY = coordy;
    this.exactPos[0].height = height;
    this.lineDisplayed = true;
    this.cd.detectChanges();
  }

  mouseMoved(event: CustomMouseEvent): void {

    const iframe = document.getElementsByTagName('iframe')[0];
    if (!this.activateLine) {
      return;
    }
    /* const checkValues =
    (screen.width > iframe.contentWindow.document.querySelectorAll('.page')[0].clientWidth) &&
    (event.Y > iframe.contentWindow.document.getElementById('viewerContainer').scrollTop); */
    if (
      this.statusLine &&
      Number(event.Page_Number) === Number(this.workingPage)
    ) {
      /* if (checkValues) {
        return;
      } */
      event.Y +=
        iframe.contentWindow.document.getElementById(
          'viewerContainer'
        ).scrollTop;
      event.X +=
        iframe.contentWindow.document.getElementById(
          'viewerContainer'
        ).scrollLeft;
      this.moveLine(this.startEndX, this.startEndY, event.X, event.Y); // + (event.Page_Number * this.elementOffset));
    }
  }

  mouseDown(event: CustomMouseEvent): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    const coordX = event.X;
    const coordY = event.Y;
    if (!this.activateLine) {
      return;
    }
    this.statusLine = !this.statusLine;
    this.workingPage = event.Page_Number;
    if (this.statusLine) {
      this.startDrawingLine(coordX, coordY, event);
      this.updateExactPosOffset({x: this.offsetX, y: this.offsetY});
      return;
    }
    if (!this.lineDisplayed) {
      return;
    }
    this.getLengthWidth();

    this.toolManagement.emitNewLine({
      component: this.line,
      length: this.line.instance.lineLength.toFixed(2),
      pageNumber: this.workingPage
    });
  }

  startDrawingLine(coordX, coordY, event): void {
    this.startEndX = coordX;
    this.startEndY = coordY;
    this.drawLine();
    this.offsetX = event.startX;
    this.offsetY = event.startY;
    this.containerPosition.x = this.offsetX;
    this.containerPosition.y = this.offsetY;
  }

  listeningEvents(): void {
    const receiveMesssage = (event) => {
      this.setEvents(event);
    };
    window.addEventListener('message', receiveMesssage, false);
  }

  setEvents(event): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    if (event.data.type === 'webpackOk' || event.data.event) {
      return;
    }
    if (
      event.data.action === 'mouseDown' ||
      event.data.action === 'mouseMoved'
    ) {
      // disable mouseDown if user click in another page
      if (
        this.workingPage &&
        Number(this.workingPage) !== Number(event.data.e.Page_Number)
      ) {
        return;
      }
      if (!this.existLineValues) {
        if (event.data.action === 'mouseDown') {
          event.data.e.startY +=
            iframe.contentWindow.document.getElementById(
              'viewerContainer'
            ).scrollTop;
        }
      }
      this[event.data.action](event.data.e);
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

  getNewColorSpan(): void {
    this.toolManagement.getNewShapeColor()
    .pipe(takeUntil(this.destroyComponent))
    .subscribe(
      (res) => {
        this.valuesBackgroundColor = res.color;
        this.cd.detectChanges();
      });
  }

  getMinMaxValuesXY(): any {
    let result = {minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity};
    const actionDragging = new DraggingShapes();
    result = actionDragging.getMinMaxValuesXY(this.line);
    return result;
  }

  getLengthWidth(): void {
    const frame = document.getElementsByTagName('iframe')[0];
    const actionDragging = new DraggingShapes();
    // workingPage
    const result = actionDragging.getLengthWidth(frame, this.workingPage);
    this.MypagePfHeight = result.MypagePfHeight;
    this.MypagePfWidth = result.MypagePfWidth;
    this.MypagePfOffsetLeft = result.MypagePfOffsetLeft;
    // OffsetTop for class('.page') and the border with 9px
    this.MypagePfOffsetTop =  result.MypagePfOffsetTop;
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
    const dragMask = document.getElementById('drag-mask-line-' + this.LineNumber);
    dragMask.style.height = page.offsetHeight + 'px';
    dragMask.style.top = page.getBoundingClientRect().top + 'px';
  }

  draggingShape($event): void {
    this.hide = false;
  }

  dragEnded($event): void {
    this.hide = true;
  }

  updateExactPosOffset(position, displacement = null): void{
    const iframe = document.getElementsByTagName('iframe')[0];
    // workingPage
    const pfX = iframe.contentWindow.document.querySelectorAll('.page')[this.workingPage - 1] as any;
    //  - correctingX
    this.exactPos[0].offsetX =  Number((position.x * 0.264583333).toFixed(1));
    //  + correctingY
    this.exactPos[0].offsetY =  Number(((pfX.offsetHeight - position.y) * 0.264583333).toFixed(1));
  }

  changeExacPos($event): void {
    const MaxMinXY = this.getMinMaxValuesXY();
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
      topBorderPointy: MaxMinXY.minY - this.MypagePfOffsetTop + $event.y,
      rightBorderPointx: MaxMinXY.maxX - this.MypagePfOffsetLeft + $event.x,
      bottomBorderPointy: MaxMinXY.maxY - this.MypagePfOffsetTop + $event.y,
      leftBorderPointx: MaxMinXY.minX - this.MypagePfOffsetLeft + $event.x,
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
    this.updateExactPosOffset({x: result.offsetXHolder, y: result.offsetYHolder}, $event);
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
  height: number;
}

interface CustomMouseEvent {
  X: number;
  Y: number;
  startX?: number;
  startY?: number;
  Page_Number: number;
}
