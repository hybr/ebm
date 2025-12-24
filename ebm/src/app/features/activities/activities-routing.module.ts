import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivitiesPage } from './pages/activities/activities.page';

const routes: Routes = [
  {
    path: '',
    component: ActivitiesPage
  },
  {
    path: 'vacancies',
    loadChildren: () => import('./vacancies/vacancies.module').then(m => m.VacanciesModule)
  },
  {
    path: 'appointments',
    loadChildren: () => import('./appointments/appointments.module').then(m => m.AppointmentsModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivitiesRoutingModule { }
