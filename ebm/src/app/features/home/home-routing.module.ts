import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'market',
    loadChildren: () => import('./pages/market/market.module').then(m => m.MarketPageModule)
  },
  {
    path: 'job',
    loadChildren: () => import('./pages/job/job.module').then(m => m.JobPageModule)
  },
  {
    path: 'visit',
    loadChildren: () => import('./pages/visit/visit.module').then(m => m.VisitPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
