import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppliedPageRoutingModule } from './applied-routing.module';

import { AppliedPage } from './applied.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppliedPageRoutingModule,
    AppliedPage
  ]
})
export class AppliedPageModule {}
