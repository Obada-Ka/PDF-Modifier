import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class HtmlEventsService {
  pageToBeLoad: EventEmitter<any> = new EventEmitter();
  zoomParentEvent: EventEmitter<any> = new EventEmitter();
  zoomChildEvent: EventEmitter<any> = new EventEmitter();
  coordXY: EventEmitter<any> = new EventEmitter();
  pageNumberParent: EventEmitter<any> = new EventEmitter();
  pageNumberChild: EventEmitter<any> = new EventEmitter();
  constructor() {}

  emitNewFile(numb, file): void {
    this.pageToBeLoad.emit({ numb, file });
  }

  emitParentNewPage(numb, specificPage = false): void {
    this.pageNumberParent.emit({ numb, specificPage });
  }

  emitChildNewPage(numb): void {
    this.pageNumberChild.emit(numb);
  }

  emitParentZoomEvent(zoomValue): void {
    this.zoomParentEvent.emit(zoomValue);
  }

  emitChildZoomEvent(zoomValue): void {
    this.zoomChildEvent.emit(zoomValue);
  }

  getnewPageEmitter(): any {
    return this.pageToBeLoad;
  }

  // mouseDown mouseMoved
  emitCoordXY(event): void {
    this.coordXY.emit(event);
  }
}
