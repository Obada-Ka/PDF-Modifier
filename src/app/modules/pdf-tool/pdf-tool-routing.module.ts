import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PdfContainerComponent } from './pages/pdf-container/pdf-container.component';
import { PdfUploadComponent } from './pages/pdf-upload/pdf-upload.component';

const routes: Routes = [
  {
    path: '', component: PdfUploadComponent
  },
  {
    path: 'pdf-tool', component: PdfContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PdfToolRoutingModule { }
