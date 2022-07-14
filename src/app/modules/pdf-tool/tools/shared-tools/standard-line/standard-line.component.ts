import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToolsEventsService } from '../../../services/tools-events.service';

@Component({
  selector: 'app-standard-line',
  templateUrl: './standard-line.component.html',
  styleUrls: ['./standard-line.component.css'],
})
export class StandardLineComponent implements OnInit, OnDestroy {
  cmpRef: ComponentRef<StandardLineComponent>;
  lineNumberId: any = '';
  destroyComponent: Subject<boolean> = new Subject<boolean>();
  destroy = false;
  points = [
    {
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0,
    },
  ];
  postion = {
    x: 0,
    y: 0,
  };
  lineLength = 0;
  backgroundColor = '#ff1a1a';
  lineType: string;
  actualLength: number;
  calc: number;
  beforeCalc: number;
  drawCircle = false;
  setCircleId: any;
  staticType: string;
  exactPos: any;
  constructor(
    private toolManagement: ToolsEventsService,
    private cd: ChangeDetectorRef
  ) {}

  linedraw(
    ax,
    ay,
    bx,
    by,
    set = false,
    setCircleId,
    scaling = false,
    type = 'line'
  ): void {
    this.staticType = type;
    this.lineType = type;
    this.points.push({
      x1: ax,
      x2: bx,
      y1: ay,
      y2: by,
    });
    let calc = Math.atan2(by - ay, bx - ax);

    calc = (calc * 180) / Math.PI;
    length = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
    this.actualLength = length;

    const beforeCalc = 90 - (calc % 360);
    this.beforeCalc = beforeCalc;

    calc = calc - 90;
    this.calc = calc;

    // var lengthInCm  = (length * 2.54 / 96).toFixed(2)

    const lengthInMm = (length * 0.264583333).toFixed(1);
    this.lineLength = Number(lengthInMm);

    if (set) {
      this.postion.x = ax;
      this.postion.y = ay;
      this.drawCircle = true;
      this.setCircleId = setCircleId;
    }
    this.cd.detectChanges();
  }

  getLowestX(): number {
    if (
      this.points[this.points.length - 1].x1 <
      this.points[this.points.length - 1].x2
    ) {
      return this.points[this.points.length - 1].x1;
    }
    return this.points[this.points.length - 1].x2;
  }

  getHighestX(): number {
    if (
      this.points[this.points.length - 1].x1 >
      this.points[this.points.length - 1].x2
    ) {
      return this.points[this.points.length - 1].x1;
    }
    return this.points[this.points.length - 1].x2;
  }

  getLowestY(): number {
    if (
      this.points[this.points.length - 1].y1 <
      this.points[this.points.length - 1].y2
    ) {
      return this.points[this.points.length - 1].y1;
    }
    return this.points[this.points.length - 1].y2;
  }

  getHighestY(): number {
    if (
      this.points[this.points.length - 1].y1 >
      this.points[this.points.length - 1].y2
    ) {
      return this.points[this.points.length - 1].y1;
    }
    return this.points[this.points.length - 1].y2;
  }

  // returns the x value of the lowest point on the Ys.
  getLowestYx(): number {
    if (
      this.points[this.points.length - 1].y1 >
      this.points[this.points.length - 1].y2
    ) {
      return this.points[this.points.length - 1].x1;
    }
    return this.points[this.points.length - 1].x2;
  }

  getColorStatus(): void {
    this.toolManagement
      .getNewShapeColor()
      .pipe(takeUntil(this.destroyComponent))
      .subscribe((res) => {
        this.lineType = this.staticType;
        this.backgroundColor = res.color;
        this.cd.detectChanges();
      });
  }

  lineSelected($event): void {
    this.toolManagement.emitSelectedLine($event.target.id);
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

  ngOnInit(): void {
    this.getColorStatus();
    this.checkCompnentStatus();
  }

  ngOnDestroy(): void {
    this.destroyComponent.next();
    this.destroyComponent.unsubscribe();
  }
}
