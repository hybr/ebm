import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppliedPage } from './applied.page';

const routes: Routes = [
  {
    path: '',
    component: AppliedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppliedPageRoutingModule {}
