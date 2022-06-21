import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PdfContainerComponent } from './pages/pdf-container/pdf-container.component';

const routes: Routes = [
  {
    path: '', component: PdfContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PdfToolRoutingModule { }
