import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppointmentsPage } from './pages/appointments/appointments.page';

const routes: Routes = [
  {
    path: '',
    component: AppointmentsPage
  },
  {
    path: 'person',
    loadChildren: () => import('./pages/person/person.module').then(m => m.PersonPageModule)
  },
  {
    path: 'organization',
    loadChildren: () => import('./pages/organization/organization.module').then(m => m.OrganizationPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentsRoutingModule {}
