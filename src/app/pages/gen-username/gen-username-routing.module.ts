import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GenUsernamePage } from './gen-username.page';

const routes: Routes = [
  {
    path: '',
    component: GenUsernamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenUsernamePageRoutingModule {}
