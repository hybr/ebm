import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { OrgAdminGuard } from '../../../core/guards/org-admin.guard';
import { VacanciesPage } from './pages/vacancies/vacancies.page';

const routes: Routes = [
  {
    path: '',
    component: VacanciesPage
  },
  {
    path: 'near-me',
    loadChildren: () => import('./pages/near-me/near-me.module').then(m => m.NearMePageModule)
  },
  {
    path: 'new',
    loadChildren: () => import('./pages/new/new.module').then(m => m.NewPageModule)
  },
  {
    path: 'top',
    loadChildren: () => import('./pages/top/top.module').then(m => m.TopPageModule)
  },
  {
    path: 'all',
    loadChildren: () => import('./pages/all/all.module').then(m => m.AllPageModule)
  },
  {
    path: 'applied',
    loadChildren: () => import('./pages/applied/applied.module').then(m => m.AppliedPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'saved',
    loadChildren: () => import('./pages/saved/saved.module').then(m => m.SavedPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'post',
    loadChildren: () => import('./pages/post/post.module').then(m => m.PostPageModule),
    canActivate: [AuthGuard, OrgAdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VacanciesRoutingModule {}
