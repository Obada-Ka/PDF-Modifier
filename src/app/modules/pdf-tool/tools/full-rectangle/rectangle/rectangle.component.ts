import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BordersValues } from '../../../models/borders';
import { UpdateLocation } from '../../../models/location';
import { HtmlEventsService } from '../../../services/html-events.service';
import { ToolsEventsService } from '../../../services/tools-events.service';
import { DraggingShapes } from '../../../shapes-actions/drag/dragging-shapes';
import { StandardLineComponent } from '../../shared-tools/standard-line/standard-line.component';

@Component({
  selector: 'app-rectangle',
  templateUrl: './rectangle.component.html',
  styleUrls: ['./rectangle.component.css'],
})
export class RectangleComponent implements OnInit, AfterViewInit, OnDestroy {
  destroyComponent: Subject<boolean> = new Subject<boolean>();
  destroy = false;
  cmpRef: ComponentRef<RectangleComponent>;
  @ViewChild('rectangleLinesContainer', { read: ViewContainerRef })
  rectangleLinesContainer: ViewContainerRef;
  rectangleId;
  valuesBackgroundColor = '#ff0f0f';
  initialEvent;
  latDragPosition;
  exactPos: CustomPosition[] = [
    {
      offsetX: 0,
      offsetY: 0,
      endX: 0,
      endY: 0,
      width: 0,
      height: 0,
    },
  ];

  startEndX: number;
  startEndY: number;
  rectangleLines = [];
  workingPage;
  optionDraw: any;
  statusRectangle = false;
  activateRectangle = false;
  editMode = false;
  hide = true;
  offsetX: any = 0;
  offsetY: any = 0;
  MypagePfHeight: number;
  MypagePfWidth: number;
  MypagePfOffsetLeft: number;
  MypagePfOffsetTop: number;
  resizeXCoordinate: number;
  rectangleDisplayed = false;
  RectanglNumber;
  containerPosition = {
    x: 0,
    y: 0,
  };
  dargMaskId;
  scaleValueforTool = 1;
  isScalled = false;
  existRectvalues;
  holderExistRectValues: any;
  existRectangle = false;
  specificPage = false;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private toolManagement: ToolsEventsService,
    private convertToHtml: HtmlEventsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listeningEvents();
    this.checkCompnentStatus();
    this.getNewColorSpan();
    this.getParentZoomingValue();
    /* this.toolManagement.getEventDataChild().subscribe((res) => {
      this.setEvents(res);
    }); */
    setTimeout(() => {
      this.drawIfExist(this.existRectvalues);
    });
  }

  ngAfterViewInit(): void {
    if (!this.existRectvalues) {
      this.mouseDown(this.initialEvent);
      return;
    }
  }

  checkCompnentStatus(): void {
    this.toolManagement.deleteShape
      .pipe(takeUntil(this.destroyComponent))
      .subscribe((res) => {
        if (this.destroy) {
          this.cmpRef.destroy();
        }
      });
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
      if (!this.existRectangle) {
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

  private drawLine(): void {
    const factory =
      this.componentFactoryResolver.resolveComponentFactory(
        StandardLineComponent
      );
    const ref = this.rectangleLinesContainer.createComponent(factory);
    this.rectangleLines.push(ref);
    const id = new Date().getMilliseconds();
    ref.instance.lineNumberId = 'draw_line_' + id;
    ref.instance.exactPos = this.exactPos;
    ref.changeDetectorRef.detectChanges();
  }

  drawIfExist(data): void {
    if (!data) {
      return;
    }
    // if the shape was not drawned in this page then we do not have to draw it
    if (data.differentSelectDrawPages) {
      this.exactPos[0].offsetX = data.data[0].value;
      this.exactPos[0].offsetY = data.data[1].value;
      this.exactPos[0].width = data.data[2].value;
      this.exactPos[0].height = data.data[3].value;
      this.toolManagement.emitNewRectangle({
        component: this.rectangleLines,
        length: '_',
        pageNumber: data.pageNumber,
        existShape: true,
        differentSelectDrawPages: true,
      });
      this.existRectvalues = null;
      return;
    }
    const iframe = document.getElementsByTagName('iframe')[0];
    let pfX = iframe.contentWindow.document.querySelectorAll('.page')[
      data.pageNumber
    ] as any;
    this.specificPage = data.specificPage;
    let correctY = 0;
    if (data.pageNumber === 1) {
      pfX = iframe.contentWindow.document.querySelectorAll('.page')[
        data.pageNumber - 1
      ] as any;
      correctY = 0;
    }
    if (!pfX) {
      pfX = iframe.contentWindow.document.querySelectorAll('.page')[
        data.pageNumber - 1
      ] as any;
      correctY = pfX.clientHeight;
    }
    this.holderExistRectValues = JSON.parse(
      JSON.stringify(this.existRectvalues)
    );
    for (let i = 0; i < 4; i++) {
      this.drawLine();
    }
    this.workingPage = data.pageNumber;
    this.startEndX = data.X1;
    this.startEndY = data.Y1;
    this.offsetX =
      data.X1 -
      (pfX.clientLeft +
        (pfX.getBoundingClientRect().left > 0
          ? pfX.getBoundingClientRect().left
          : 0));
    this.offsetY =
      data.Y1 - (pfX.clientTop + correctY + pfX.getBoundingClientRect().top);
    this.containerPosition.x = this.offsetX;
    this.containerPosition.y = this.offsetY;
    this.moveLine(data.X1, data.Y1, data.X2, data.Y2);
    if (this.existRectvalues) {
      this.existRectangle = true;
      this.getLengthWidth();
      this.updateExactPosOffset();
      const perimeter = this.calculatePerimeterRectangle(this.rectangleLines);
      this.toolManagement.emitNewRectangle({
        component: this.rectangleLines,
        length: perimeter.toFixed(2),
        pageNumber: this.workingPage,
        existShape: true,
      });
      this.existRectvalues = null;
    }
  }

  moveLine(oldx, oldy, coordx, coordy): void {
    if (this.latDragPosition) {
      coordx -= this.latDragPosition.x;
      coordy -= this.latDragPosition.y;
    }
    const posX = Math.min(oldx, coordx);
    // const posY = Math.min(oldy, coordy);
    this.resizeXCoordinate = Math.max(oldx, coordx);
    this.rectangleLines[0].instance.linedraw(
      oldx,
      oldy,
      oldx,
      coordy,
      false,
      0,
      false,
      this.optionDraw
    );
    this.rectangleLines[1].instance.linedraw(
      oldx,
      oldy,
      coordx,
      oldy,
      false,
      0,
      false,
      this.optionDraw
    );
    this.rectangleLines[2].instance.linedraw(
      oldx,
      coordy,
      coordx,
      coordy,
      false,
      0,
      false,
      this.optionDraw
    );
    this.rectangleLines[3].instance.linedraw(
      coordx,
      oldy,
      coordx,
      coordy,
      false,
      0,
      false,
      this.optionDraw
    );
    const height = this.rectangleLines[0].instance.lineLength;
    const width = this.rectangleLines[2].instance.lineLength;
    this.exactPos[0].endX = posX;
    this.exactPos[0].endY = Math.max(oldy, coordy);
    this.exactPos[0].width = width;
    this.exactPos[0].height = height;
    this.rectangleDisplayed = true;
  }

  mouseMoved(event: CustomMouseEvent): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    if (!this.activateRectangle) {
      return;
    }
    /* const checkValues =
    (screen.width > iframe.contentWindow.document.querySelectorAll('.page')[0].clientWidth) &&
    (event.Y > iframe.contentWindow.document.getElementById('viewerContainer').scrollTop); */
    if (
      this.statusRectangle &&
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
    if (!this.activateRectangle || !event) {
      return;
    }
    this.statusRectangle = !this.statusRectangle;
    this.workingPage = event.Page_Number;
    if (this.statusRectangle) {
      this.startDrawingRectangle(event);
      return;
    }

    this.getLengthWidth();
    this.updateExactPosOffset();

    if (!this.rectangleDisplayed) {
      return;
    }

    const perimeter = this.calculatePerimeterRectangle(this.rectangleLines);
    if (!this.editMode) {
      this.toolManagement.emitNewRectangle({
        component: this.rectangleLines,
        length: perimeter.toFixed(2),
        pageNumber: this.workingPage,
      });
      return;
    }
    this.toolManagement.emitModifiedRectangle({
      rectangleId: this.rectangleId,
      length: perimeter.toFixed(2),
      pageNumber: this.workingPage,
    });
  }

  startDrawingRectangle(event): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    const pageHeight = (
      iframe.contentWindow.document.querySelectorAll('.page')[
        event.Page_Number - 1
      ] as any
    ).offsetHeight;
    if (event.startY > pageHeight * event.Page_Number) {
      return;
    }
    this.startEndX = event.X;
    this.startEndY = event.Y; // + (event.Page_Number * this.elementOffset);
    for (let i = 0; i < 4; i++) {
      this.drawLine();
    }
    this.offsetX = event.startX;
    this.offsetY = event.startY;
    this.containerPosition.x = this.offsetX;
    this.containerPosition.y = this.offsetY;
  }

  activateDrawingRectangle(): void {
    this.toolManagement.emitNewTool({ tool: 'draw_rectangle', editMode: true });
    this.toolManagement.emitSelectedLine(
      this.rectangleLines[0].instance.lineNumberId
    );
    this.activateRectangle = true;
    this.statusRectangle = true;
    this.editMode = true;
  }

  getNewColorSpan(): void {
    this.toolManagement
      .getNewShapeColor()
      .pipe(takeUntil(this.destroyComponent))
      .subscribe((res) => {
        this.valuesBackgroundColor = res.color;
      });
  }

  getLengthWidth(): void {
    const frame = document.getElementsByTagName('iframe')[0];
    const actionDragging = new DraggingShapes();
    const result = actionDragging.getLengthWidth(
      frame,
      this.workingPage,
      this.specificPage
    );
    this.MypagePfHeight = result.MypagePfHeight;
    this.MypagePfWidth = result.MypagePfWidth;
    this.MypagePfOffsetLeft = result.MypagePfOffsetLeft;
    // OffsetTop for class('.page') and the border with 9px
    this.MypagePfOffsetTop =
      result.MypagePfOffsetTop +
      +(this.specificPage
        ? 0
        : frame.contentWindow.document.getElementById('viewerContainer')
            .scrollTop);
  }

  calculatePerimeterRectangle(lines): number {
    let result = 0;
    lines.forEach((element) => {
      result = result + element.instance.lineLength;
    });
    return result;
  }

  getLeftBottomCornerCords(): any {
    // Minx , Maxy
    const result = { x: Infinity, y: -Infinity };
    this.rectangleLines.forEach((line) => {
      if (result.x > line.instance.getLowestX()) {
        result.x = line.instance.getLowestX();
      }
      if (result.y < line.instance.getHighestY()) {
        result.y = line.instance.getHighestY();
      }
    });
    return result;
  }

  getMinMaxValuesXY(): any {
    let result = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    };
    const actionDragging = new DraggingShapes();
    result = actionDragging.getMinMaxValuesXY(this.rectangleLines);
    return result;
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

  // Dragging Rectangle

  dragStarted($event): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    const pages = iframe.contentWindow.document.querySelectorAll('.page');
    if (!this.isScalled || !pages[this.workingPage - 1]) {
      return;
    }
    const page = pages[this.workingPage - 1] as any;
    const dragMask = document.getElementById(
      'drag-mask-rectangle-' + this.RectanglNumber
    );
    dragMask.style.height = page.offsetHeight + 'px';
    dragMask.style.top = page.getBoundingClientRect().top + 'px';
  }

  draggingShape($event): void {
    this.hide = false;
    this.cd.detectChanges();
  }

  dragEnded($event): void {
    this.hide = true;
    this.cd.detectChanges();
  }

  updateExactPosOffset(
    displacement = null,
    correctValuesAfterBorders = null
  ): void {
    if (this.editMode) {
      displacement = this.latDragPosition;
    }
    const iframe = document.getElementsByTagName('iframe')[0];
    const pfX = iframe.contentWindow.document.querySelectorAll('.page')[
      this.workingPage - 1
    ] as any;
    const leftBottomCordsXY = this.getLeftBottomCornerCords();
    const actionDragging = new DraggingShapes();
    // tslint:disable-next-line:prefer-const
    let values: UpdateLocation = {
      displacementXY: displacement,
      correctValuesAfterBordersXY: correctValuesAfterBorders,
      iframePage: iframe,
      pfXX: pfX,
      leftBottomCords: leftBottomCordsXY,
      workingPage: this.workingPage,
      specificPage: this.specificPage,
    };
    const result = actionDragging.updateExactPosOffset(values);
    this.exactPos[0].offsetX = Number((result.finalX * 0.264583333).toFixed(1));
    this.exactPos[0].offsetY = Number((result.finalY * 0.264583333).toFixed(1));
    this.toolManagement.emitCoordXY(this.exactPos, this.workingPage);
  }

  changeExacPos($event): void {
    this.latDragPosition = $event;
    const leftBottomCordsXY = this.getLeftBottomCornerCords();
    // leftBottomCords=>MinX, MaxY
    const MaxMinXY = this.getMinMaxValuesXY();
    const correctingY = this.MypagePfOffsetTop;
    let correctValuesAfterBorders;
    const actionDragging = new DraggingShapes();
    // tslint:disable-next-line:prefer-const
    let allValues: BordersValues = {
      MypagePfWidth: this.MypagePfWidth,
      MypagePfOffsetLeft: this.MypagePfOffsetLeft,
      MypagePfHeight: this.MypagePfHeight,
      MypagePfOffsetTop: this.MypagePfOffsetTop,
      eventXHolder: $event.x,
      eventYHolder: $event.y,
      offsetXHolder: leftBottomCordsXY.x - this.MypagePfOffsetLeft + $event.x,
      offsetYHolder: this.MypagePfHeight - leftBottomCordsXY.y + correctingY,
      topBorderPointy: MaxMinXY.minY - this.MypagePfOffsetTop + $event.y,
      rightBorderPointx: MaxMinXY.maxX - this.MypagePfOffsetLeft + $event.x,
      bottomBorderPointy: MaxMinXY.maxY - this.MypagePfOffsetTop + $event.y,
      leftBorderPointx: MaxMinXY.minX - this.MypagePfOffsetLeft + $event.x,
      leftBottomCords: leftBottomCordsXY,
      containerPosition: this.containerPosition,
      checkBorder: false,
    };
    const result = actionDragging.checkBorders(allValues);
    if (result.checkBorder) {
      correctValuesAfterBorders = {
        x: 0,
        y: 0,
      };
      correctValuesAfterBorders.x = result.offsetXHolder;
      correctValuesAfterBorders.y = result.offsetYHolder;
      this.containerPosition = {
        x: result.containerPosition.x,
        y: result.containerPosition.y - 34,
      };
    }

    this.updateExactPosOffset($event, correctValuesAfterBorders);
  }

  ngOnDestroy(): void {
    this.destroyComponent.next();
    this.destroyComponent.unsubscribe();
  }
}

interface CustomMouseEvent {
  X: number;
  Y: number;
  startX?: number;
  startY?: number;
  Page_Number: number;
}

interface CustomPosition {
  offsetX: number;
  offsetY: number;
  endX: number;
  endY: number;
  width: number;
  height: number;
}
