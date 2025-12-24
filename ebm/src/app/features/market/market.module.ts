import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MarketRoutingModule } from './market-routing.module';
import { MarketPage } from './pages/market/market.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarketRoutingModule,
    MarketPage
  ]
})
export class MarketModule { }
