import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'market',
    loadChildren: () => import('./features/market/market.module').then(m => m.MarketModule)
  },
  {
    path: 'activities',
    loadChildren: () => import('./features/activities/activities.module').then(m => m.ActivitiesModule)
  },
  {
    path: 'work',
    loadChildren: () => import('./features/work/work.module').then(m => m.WorkModule)
  },
  {
    path: 'my',
    loadChildren: () => import('./features/my/my.module').then(m => m.MyModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./features/account/account.module').then(m => m.AccountModule)
  },
  // Legacy redirects for backward compatibility
  {
    path: 'home/market',
    redirectTo: 'market',
    pathMatch: 'full'
  },
  {
    path: 'home/job',
    redirectTo: 'activities/vacancies',
    pathMatch: 'prefix'
  },
  {
    path: 'home/visit',
    redirectTo: 'activities/appointments',
    pathMatch: 'prefix'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
