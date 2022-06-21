import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PdfToolRoutingModule } from './pdf-tool-routing.module';
import { PdfContainerComponent } from './pages/pdf-container/pdf-container.component';
import { PageGeneratorComponent } from './components/page-generator/page-generator.component';
import { ModificationsListComponent } from './components/modifications-list/modifications-list.component';


@NgModule({
  declarations: [PdfContainerComponent, PageGeneratorComponent, ModificationsListComponent],
  imports: [
    CommonModule,
    PdfToolRoutingModule
  ]
})
export class PdfToolModule { }
