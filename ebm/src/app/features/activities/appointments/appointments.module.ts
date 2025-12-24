import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppointmentsRoutingModule } from './appointments-routing.module';
import { AppointmentsPage } from './pages/appointments/appointments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentsRoutingModule,
    AppointmentsPage
  ]
})
export class AppointmentsModule {}
