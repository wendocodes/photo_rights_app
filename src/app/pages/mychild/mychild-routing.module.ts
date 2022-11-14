import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MychildPage } from './mychild.page';

const routes: Routes = [
  {
    path: '',
    component: MychildPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MychildPageRoutingModule {}
