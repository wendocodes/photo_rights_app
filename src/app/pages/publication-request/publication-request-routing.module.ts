import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PublicationRequestPage } from './publication-request.page';

const routes: Routes = [
  {
    path: '',
    component: PublicationRequestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicationRequestPageRoutingModule {}
