import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VacanciesPageRoutingModule } from './vacancies-routing.module';

import { VacanciesPage } from './vacancies.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VacanciesPageRoutingModule,
    VacanciesPage
  ]
})
export class VacanciesPageModule {}
