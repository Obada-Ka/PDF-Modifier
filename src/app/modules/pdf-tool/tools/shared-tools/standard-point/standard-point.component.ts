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
  selector: 'app-standard-point',
  templateUrl: './standard-point.component.html',
  styleUrls: ['./standard-point.component.css'],
})
export class StandardPointComponent implements OnInit, OnDestroy {
  destroyComponent: Subject<boolean> = new Subject<boolean>();
  cmpRef: ComponentRef<StandardPointComponent>;
  destroy = false;
  backgroundColor = '#ff1a1a';
  pointNumberId: any = '';
  pointType: string;
  staticType: string;
  exactPos: any;
  postion = {
    x: 0,
    y: 0,
  };
  points = [
    {
      x: 0,
      y: 0,
    },
  ];
  constructor(
    private toolManagement: ToolsEventsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getColorStatus();
    this.checkCompnentStatus();
  }

  pointDraw(ax, ay, type = 'dot'): void {
    this.staticType = type;
    this.pointType = type;
    this.points.push({
      x: ax,
      y: ay,
    });
    this.cd.detectChanges();
  }

  getColorStatus(): void {
    this.toolManagement
      .getNewShapeColor()
      .pipe(takeUntil(this.destroyComponent))
      .subscribe((res) => {
        this.backgroundColor = res.color;
        this.cd.detectChanges();
      });
  }

  pointSelected($event): void {
    this.toolManagement.emitSelectedPoint($event.target.id);
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

  ngOnDestroy(): void {
    this.destroyComponent.next();
    this.destroyComponent.unsubscribe();
  }
}
