import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VacanciesPage } from './vacancies.page';

const routes: Routes = [
  {
    path: '',
    component: VacanciesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VacanciesPageRoutingModule {}
