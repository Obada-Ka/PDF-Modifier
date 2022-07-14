import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PdfToolRoutingModule } from './pdf-tool-routing.module';
import { PdfContainerComponent } from './pages/pdf-container/pdf-container.component';
import { PageGeneratorComponent } from './components/page-generator/page-generator.component';
import { ModificationsListComponent } from './components/modifications-list/modifications-list.component';
import { PdfUploadComponent } from './pages/pdf-upload/pdf-upload.component';
import { HtmlEventsService } from './services/html-events.service';
import { ToolsEventsService } from './services/tools-events.service';
import { AngularDraggableModule } from 'angular2-draggable';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { ManageRectanglesComponent } from './tools/full-rectangle/manage-rectangles.component';
import { StandardPointComponent } from './tools/shared-tools/standard-point/standard-point.component';
import { ManageLinesComponent } from './tools/full-line/manage-lines.component';
import { ManagePointsComponent } from './tools/full-point/manage-points.component';
import { RectangleComponent } from './tools/full-rectangle/rectangle/rectangle.component';
import { PointComponent } from './tools/full-point/point/point.component';
import { LineComponent } from './tools/full-line/line/line.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from './services/global.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { StandardLineComponent } from './tools/shared-tools/standard-line/standard-line.component';

@NgModule({
  declarations: [
    PdfContainerComponent,
    PageGeneratorComponent,
    ModificationsListComponent,
    PdfUploadComponent,
    StandardPointComponent,
    StandardLineComponent,
    ManageRectanglesComponent,
    ManageLinesComponent,
    ManagePointsComponent,
    RectangleComponent,
    PointComponent,
    LineComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    PdfToolRoutingModule,
    AngularDraggableModule,
    PdfJsViewerModule,
  ],
  providers: [HtmlEventsService, ToolsEventsService, GlobalService],
})
export class PdfToolModule {}
