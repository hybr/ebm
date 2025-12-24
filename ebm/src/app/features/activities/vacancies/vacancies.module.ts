import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VacanciesRoutingModule } from './vacancies-routing.module';
import { VacanciesPage } from './pages/vacancies/vacancies.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VacanciesRoutingModule,
    VacanciesPage
  ]
})
export class VacanciesModule {}
