import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class ToolsEventsService {
  POINT_TOOL_KEY = 'draw_point';
  LINE_TOOL_KEY = 'draw_line';
  POLYGONIAL_TOOL_KEY = 'draw_polygonal';
  RECTANGLE_TOOL_KEY = 'draw_rectangle';
  coordXY: EventEmitter<any> = new EventEmitter();
  chosenTool: EventEmitter<any> = new EventEmitter();
  existenceShape: EventEmitter<any> = new EventEmitter();
  previousData: EventEmitter<any> = new EventEmitter();
  previewData: EventEmitter<any> = new EventEmitter();
  selectedText: EventEmitter<any> = new EventEmitter();
  allSelectedText: EventEmitter<any> = new EventEmitter();
  drawnShape: EventEmitter<any> = new EventEmitter();
  drawnShapeColor: EventEmitter<any> = new EventEmitter();
  deleteShape: EventEmitter<any> = new EventEmitter();
  drawnPolygonal: EventEmitter<any> = new EventEmitter();
  drawnRectangle: EventEmitter<any> = new EventEmitter();
  editDrawnRectangle: EventEmitter<any> = new EventEmitter();
  drawnLine: EventEmitter<any> = new EventEmitter();
  drawnPoint: EventEmitter<any> = new EventEmitter();
  lineId: EventEmitter<any> = new EventEmitter();
  pointId: EventEmitter<any> = new EventEmitter();
  eventData: EventEmitter<any> = new EventEmitter();
  eventDataChild: EventEmitter<any> = new EventEmitter();
  addEventListenerWindow(set = false): any {
    if (set) {
      window.addEventListener('message', (event) => {
        this.emitEventData(event);
      });
      return;
    }
  }

  emitEventData(data): void {
    this.eventData.emit(data);
  }

  getEventData(): any {
    return this.eventData;
  }

  emitEventDataChild(data): void {
    this.eventDataChild.emit(data);
  }

  getEventDataChild(): any {
    return this.eventDataChild;
  }

  emitNewTool({ tool, editMode, selectMode = false }): void {
    this.chosenTool.emit({ tool, editMode, selectMode });
  }

  emitNewSelectedText({ type, value, pageNumber, selectMode = false }): void {
    this.selectedText.emit({ type, value, pageNumber, selectMode });
  }

  emitPreviousData({ type, value, pageNumber, selectMode = false }): void {
    this.previousData.emit({ type, value, pageNumber, selectMode });
  }

  emitPreviewData(data): void {
    this.previewData.emit(data);
  }

  emitAllSelectedText(data): void {
    this.allSelectedText.emit(data);
  }

  getSelectedTextValue(): any {
    return this.selectedText;
  }

  getAllSelectedTextValue(): any {
    return this.allSelectedText;
  }

  getExactCoordXY(): any {
    return this.coordXY;
  }

  getnewTool(): any {
    return this.chosenTool;
  }

  getNewShape(): any {
    return this.drawnShape;
  }

  getNewShapeColor(): any {
    return this.drawnShapeColor;
  }

  getPreviousData(): any {
    return this.previousData;
  }

  getPreviewData(): any {
    return this.previewData;
  }

  getExistenceShape(): any {
    return this.existenceShape;
  }

  emitNewShape({
    type,
    component,
    length,
    pageNumber,
    existShape = null,
    editMode,
    differentSelectDrawPages = false,
  }): void {
    this.drawnShape.emit({
      type,
      component,
      length,
      pageNumber,
      existShape,
      editMode,
      differentSelectDrawPages,
    });
  }

  emitEditShape({ type, component, length, pageNumber }): void {
    this.drawnShape.emit({ type, component, length, pageNumber });
  }

  emitNewPolygonal({ component, length, pageNumber }): void {
    this.drawnPolygonal.emit({ component, length, pageNumber });
  }

  emitNewRectangle({
    component,
    length,
    pageNumber,
    existShape = null,
    differentSelectDrawPages = false,
  }): void {
    this.drawnRectangle.emit({
      component,
      length,
      pageNumber,
      existShape,
      differentSelectDrawPages,
    });
  }

  emitModifiedRectangle({ rectangleId, length, pageNumber }): void {
    this.editDrawnRectangle.emit({ rectangleId, length, pageNumber });
  }

  emitNewLine({
    component,
    length,
    pageNumber,
    existShape = null,
    differentSelectDrawPages = false,
  }): void {
    this.drawnLine.emit({
      component,
      length,
      pageNumber,
      existShape,
      differentSelectDrawPages,
    });
  }

  emitNewPoint({
    component,
    pageNumber,
    existShape = null,
    differentSelectDrawPages = false,
  }): void {
    this.drawnPoint.emit({
      component,
      pageNumber,
      existShape,
      differentSelectDrawPages,
    });
  }

  emitNewShapeColor({ className, color }): void {
    this.drawnShapeColor.emit({ className, color });
  }

  emitDeleteShape({ shape_index, shape_type }): void {
    this.deleteShape.emit({ shape_index, shape_type });
  }

  emitSelectedLine(lineId): void {
    this.lineId.emit({ lineId });
  }

  emitSelectedPoint(pointId): void {
    this.pointId.emit({ pointId });
  }

  emitCoordXY(data, pageNumber = null): void {
    if (pageNumber) {
      this.coordXY.emit({ data, pageNumber });
      return;
    }
    this.coordXY.emit(data);
  }

  emitExistenceShape(data): void {
    this.existenceShape.emit(data);
  }
}
