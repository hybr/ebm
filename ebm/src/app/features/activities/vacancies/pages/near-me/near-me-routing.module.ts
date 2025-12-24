import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NearMePage } from './near-me.page';

const routes: Routes = [
  {
    path: '',
    component: NearMePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NearMePageRoutingModule {}
