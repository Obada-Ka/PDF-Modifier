import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HtmlEventsService } from '../../services/html-events.service';
import { ToolsEventsService } from '../../services/tools-events.service';

@Component({
  selector: 'app-modifications-list',
  templateUrl: './modifications-list.component.html',
  styleUrls: ['./modifications-list.component.css'],
})
export class ModificationsListComponent implements OnInit, OnDestroy {
  destroy: Subject<boolean> = new Subject<boolean>();
  drawnShapes = [];
  selectedTextValues = [];
  selectedRow: number = undefined;
  paintsMini = false;
  selectMode = false;
  selectedText: any;
  disableFunctionality = false;
  constructor(
    private toolManagement: ToolsEventsService,
    private convertToHtml: HtmlEventsService,
    private cd: ChangeDetectorRef
  ) {}

  getNewShapes(): void {
    this.toolManagement
      .getNewShape()
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        this.disableFunctionality = res.differentSelectDrawPages;
        if (!res.editMode || res.existShape === true) {
          this.drawnShapes.push(res);
          this.cd.detectChanges();
          return;
        }
        const editShapeIndex = this.drawnShapes.findIndex((rectangle) => {
          return (
            rectangle.type === res.type &&
            rectangle.component.instance.rectangleId ===
              res.component.instance.rectangleId
          );
        });
        this.drawnShapes[editShapeIndex].length = res.length;
        this.cd.detectChanges();
        return;
      });
  }

  getNewSelectedText(): void {
    this.toolManagement
      .getSelectedTextValue()
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        this.selectMode = true;
        const typeIndex = this.selectedTextValues.findIndex(
          (element) => element.type === res.type
        );
        if (typeIndex === -1) {
          this.selectedTextValues.push(res);
        } else {
          this.selectedTextValues[typeIndex] = res;
        }

        this.toolManagement.emitAllSelectedText(this.selectedTextValues);
        this.cd.detectChanges();
      });
  }

  scorllToShapeText(element, index): void {
    this.selectedRow = index;
    const frame = document.getElementsByTagName('iframe')[0];
    if (element.pageNumber === '_') {
      return;
    }
    frame.contentWindow.document
      .querySelectorAll('.page')
      [element.pageNumber - 1].scrollIntoView({
        behavior: 'smooth',
      });
    this.convertToHtml.emitParentNewPage(element.pageNumber);
    this.convertToHtml.emitChildNewPage(element.pageNumber);
    if (element.selectMode) {
      this.selectedText = element;
      /* this.changeTextColor(element); */
      return;
    }
    this.changeShapeColor(element);
  }

  changeShapeColor(shape): void {
    if (shape.type === 'Line') {
      this.toolManagement.emitNewShapeColor({
        className: 'draw_line',
        color: '#ff1a1a',
      });
      shape.component.instance.line.instance.backgroundColor = '#f1de2e';
      shape.component.instance.line.instance.lineType = 'chosen_line';
      shape.component.instance.valuesBackgroundColor = '#0e0e0e';
    } else if (shape.type === 'Point') {
      this.toolManagement.emitNewShapeColor({
        className: 'draw_polygonal',
        color: '#ff1a1a',
      });
      shape.component.instance.valuesBackgroundColor = '#0e0e0e';
      shape.component.instance.point.instance.backgroundColor = '#f1de2e';
    } else {
      this.toolManagement.emitNewShapeColor({
        className: 'draw_polygonal',
        color: '#ff1a1a',
      });
      shape.component.instance.valuesBackgroundColor = '#0e0e0e';
      shape.component.instance[shape.type.toLowerCase() + 'Lines'].forEach(
        (line) => {
          line.instance.backgroundColor = '#f1de2e';
        }
      );
    }
  }

  changeTextColor(textType): void {
    const allTypes = [
      { key: 'B', color: '#2ed105' },
      { key: 'A', color: '#4b89fc' },
      { key: 'E', color: '#fc664b' },
    ];
    const frames = document.getElementsByTagName('iframe')[0];
    const splited = textType.type.split('_');
    const index = splited.findIndex((el) => el.length === 1);
    const allTypeIndex = allTypes.findIndex((el) => el.key === splited[index]);
    if (
      frames.contentWindow.document.querySelectorAll('.' + splited[index])
        .length
    ) {
      frames.contentWindow.document
        .querySelectorAll('.' + splited[index])
        .forEach((element) => {
          (element as any).style.backgroundColor = allTypes[allTypeIndex].color;
        });
      allTypes.forEach((type) => {
        if (type.key === splited[index]) {
          return;
        }
        frames.contentWindow.document
          .querySelectorAll('.' + type.key)
          .forEach((element) => {
            (element as any).style.backgroundColor = 'transparent';
          });
      });
    }
  }

  deleteShape(shape, indexInDrawnShapes): void {
    if (Array.isArray(shape.component)) {
      shape.component.forEach((component) => {
        component.instance.destroy = true;
        component.instance.cmpRef = component;
      });
    } else {
      shape.component.instance.destroy = true;
      shape.component.instance.cmpRef = shape.component;
    }
    this.toolManagement.emitDeleteShape({
      shape_index: indexInDrawnShapes,
      shape_type: shape.type,
    });
    this.selectedRow = undefined;
    this.drawnShapes.splice(indexInDrawnShapes, 1);
    this.cd.detectChanges();
    if (!this.drawnShapes.length) {
      this.toolManagement.emitCoordXY(null);
      return;
    }
    this.toolManagement.emitCoordXY(
      this.drawnShapes[this.drawnShapes.length - 1].component.instance.exactPos,
      this.drawnShapes[this.drawnShapes.length - 1].pageNumber
    );
  }

  deleteText(text, indexInSelectedTextValues): void {
    this.selectedTextValues.splice(indexInSelectedTextValues, 1);
    this.toolManagement.emitAllSelectedText(this.selectedTextValues);
    this.selectedRow = undefined;
    const frames = document.getElementsByTagName('iframe')[0];
    const splited = text.type.split('_');
    const index = splited.findIndex((el) => el.length === 1);
    frames.contentWindow.document
      .querySelectorAll('.' + splited[index])
      .forEach((element) => {
        element.remove();
      });
    this.selectedText = null;
    this.cd.detectChanges();
  }

  checkSelectedLine(): void {
    this.toolManagement.lineId
      .pipe(takeUntil(this.destroy))
      .subscribe((line) => {
        const shapeIndex = this.drawnShapes.findIndex((shape) => {
          if (shape.type === 'Line') {
            return (
              shape.component.instance.line.instance.lineNumberId ===
              line.lineId
            );
          } else {
            if (
              shape.component.instance[
                shape.type.toLowerCase() + 'Lines'
              ].findIndex((nestedShape) => {
                return nestedShape.instance.lineNumberId === line.lineId;
              }) > -1
            ) {
              return true;
            }
          }
        });
        this.selectedRow = shapeIndex;
        this.changeShapeColor(this.drawnShapes[shapeIndex]);
        this.cd.detectChanges();
      });
  }

  checkSelectedPoint(): void {
    this.toolManagement.pointId
      .pipe(takeUntil(this.destroy))
      .subscribe((point) => {
        const shapeIndex = this.drawnShapes.findIndex((shape) => {
          if (shape.type === 'Point') {
            return (
              shape.component.instance.point.instance.pointNumberId ===
              point.pointId
            );
          } else {
            if (
              shape.component.instance[
                shape.type.toLowerCase() + 'Points'
              ].findIndex((nestedShape) => {
                return nestedShape.instance.lineNumberId === point.pointId;
              }) > -1
            ) {
              return true;
            }
          }
        });
        this.selectedRow = shapeIndex;
        this.changeShapeColor(this.drawnShapes[shapeIndex]);
        this.cd.detectChanges();
      });
  }

  getPreviousData(): void {
    this.toolManagement
      .getPreviousData()
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        // selected Texts
        if (!res.selectMode) {
          return;
        }
        this.selectMode = true;
        this.selectedTextValues.push(res);
        this.toolManagement.emitAllSelectedText(this.selectedTextValues);
        this.cd.detectChanges();
      });
  }

  minimizeElement(): void {
    this.paintsMini = !this.paintsMini;
  }

  onKeyDelete(): void {
    const that = this;
    // tslint:disable-next-line:only-arrow-functions
    document.addEventListener(
      'keydown',
      // tslint:disable-next-line:only-arrow-functions
      function(ev): void {
        if (that.selectedRow === undefined) {
          return;
        }
        if (ev.code === 'Delete') {
          if (that.selectMode) {
            that.deleteText(that.selectedText, that.selectedRow);
            that.cd.detectChanges();
            return;
          }
          that.deleteShape(
            that.drawnShapes[that.selectedRow],
            that.selectedRow
          );
          that.cd.detectChanges();
        }
      },
      false
    );
  }

  ngOnInit(): void {
    this.getNewShapes();
    this.getPreviousData();
    this.getNewSelectedText();
    this.checkSelectedLine();
    this.checkSelectedPoint();
    this.onKeyDelete();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}
