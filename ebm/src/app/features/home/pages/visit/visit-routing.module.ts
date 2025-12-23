import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitPage } from './visit.page';

const routes: Routes = [
  {
    path: '',
    component: VisitPage
  },  {
    path: 'organization',
    loadChildren: () => import('./organization/organization.module').then( m => m.OrganizationPageModule)
  },
  {
    path: 'person',
    loadChildren: () => import('./person/person.module').then( m => m.PersonPageModule)
  },
  {
    path: 'place',
    loadChildren: () => import('./place/place.module').then( m => m.PlacePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitPageRoutingModule {}
