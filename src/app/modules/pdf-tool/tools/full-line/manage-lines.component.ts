import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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
export class ManageLinesComponent implements OnInit, OnDestroy {
  @ViewChild('divLinesContainer', { read: ViewContainerRef })
  divLinesContainer: ViewContainerRef;
  destroy: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-input-rename
  // @Input('currentZoomingValue') currentZoomingValue: number;
  lines = [];
  optionDraw: any;
  linesNumber = 1;
  activateDrawing = false;
  status = false;
  eventData: any;
  scaleValueforTool = 1;
  isScalled = false;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private toolManagement: ToolsEventsService,
    private convertToHtml: HtmlEventsService
  ) {}

  ngOnInit(): void {
    this.getNewLine();
    this.getParentZoomingValue();
    this.checkToolStatus();
    this.checkLinesStatus();
    this.listeningEvents();
  }

  private drawLine(): void {
    const factory =
      this.componentFactoryResolver.resolveComponentFactory(LineComponent);
    const ref: any = this.divLinesContainer.createComponent(factory);
    this.lines.push(ref);
    this.linesNumber = this.lines.length;
    ref.instance.activateLine = true;
    ref.instance.lineNumberId = 'line_' + this.linesNumber;
    ref.instance.optionDraw = this.optionDraw;
    ref.instance.initialEvent = this.eventData;
    ref.instance.dargMaskId = 'drag-mask-line-' + this.linesNumber;
    ref.instance.LineNumber = this.linesNumber;
    ref.instance.scaleValueforTool = this.scaleValueforTool;
    ref.instance.isScalled = this.isScalled;
    ref.changeDetectorRef.detectChanges();
    this.activateDrawing = false;
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
          this.status = false;
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
        this.toolManagement.emitNewShape({
          type: 'Line',
          component: this.lines[this.lines.length - 1],
          length: res.length,
          pageNumber: res.pageNumber,
          editMode: false,
        });
        this.lines[this.lines.length - 1].instance.activateLine = false;
        this.activateDrawing = true;
        this.status = false;
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

  mouseDown(event): void {
    if (!this.activateDrawing) {
      return;
    }

    this.status = !this.status;
    if (this.status) {
      this.eventData = event;
      this.drawLine();
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}
