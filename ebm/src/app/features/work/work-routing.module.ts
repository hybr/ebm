import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { FeatureGuard } from '../../core/guards/feature.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule),
    canActivate: [AuthGuard, FeatureGuard],
    data: { featureKey: 'work_dashboard' }
  },
  {
    path: 'processes',
    loadChildren: () => import('./pages/processes/processes.module').then( m => m.ProcessesPageModule)
  },
  {
    path: 'tasks',
    loadChildren: () => import('./pages/tasks/tasks.module').then( m => m.TasksPageModule)
  },
  {
    path: 'analytics',
    loadChildren: () => import('./pages/analytics/analytics.module').then( m => m.AnalyticsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkRoutingModule { }
