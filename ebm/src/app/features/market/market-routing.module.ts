import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketPage } from './pages/market/market.page';

const routes: Routes = [
  {
    path: '',
    component: MarketPage
  },
  {
    path: 'goods',
    loadChildren: () => import('./pages/goods/goods.module').then(m => m.GoodsPageModule)
  },
  {
    path: 'services',
    loadChildren: () => import('./pages/services/services.module').then(m => m.ServicesPageModule)
  },
  {
    path: 'rentals',
    loadChildren: () => import('./pages/rentals/rentals.module').then(m => m.RentalsPageModule)
  },
  {
    path: 'needs',
    loadChildren: () => import('./pages/needs/needs.module').then(m => m.NeedsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketRoutingModule { }
