import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobPage } from './job.page';

const routes: Routes = [
  {
    path: '',
    component: JobPage
  },  {
    path: 'vacancies',
    loadChildren: () => import('./vacancies/vacancies.module').then( m => m.VacanciesPageModule)
  },
  {
    path: 'applied',
    loadChildren: () => import('./applied/applied.module').then( m => m.AppliedPageModule)
  },
  {
    path: 'saved',
    loadChildren: () => import('./saved/saved.module').then( m => m.SavedPageModule)
  },
  {
    path: 'post',
    loadChildren: () => import('./post/post.module').then( m => m.PostPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobPageRoutingModule {}
