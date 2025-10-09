import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'trading',
    loadComponent: () => import('./components/trading/grid-bot-dashboard/grid-bot-dashboard.component').then(m => m.GridBotDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'trading/bot/create',
    loadComponent: () => import('./components/trading/bot-config-page/bot-config-page.component').then(m => m.BotConfigPageComponent),
    canActivate: [AuthGuard],
    data: { mode: 'create' }
  },
  {
    path: 'trading/bot/edit/:id',
    loadComponent: () => import('./components/trading/bot-config-page/bot-config-page.component').then(m => m.BotConfigPageComponent),
    canActivate: [AuthGuard],
    data: { mode: 'edit' }
  },
  {
    path: 'trading/bot/view/:id',
    loadComponent: () => import('./components/trading/bot-config-page/bot-config-page.component').then(m => m.BotConfigPageComponent),
    canActivate: [AuthGuard],
    data: { mode: 'view' }
  },
  {
    path: 'trading/manual',
    loadComponent: () => import('./components/trading/trading-dashboard/trading-dashboard.component').then(m => m.TradingDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'trading/funding-rates',
    loadComponent: () => import('./components/trading/funding-rates/funding-rates.component').then(m => m.FundingRatesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'trading/funding-revenue',
    loadComponent: () => import('./components/trading/funding-revenue/funding-revenue.component').then(m => m.FundingRevenueComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'chart-demo',
    loadComponent: () => import('./components/chart-demo/chart-demo.component').then(m => m.ChartDemoComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'testing/api-tester',
    loadComponent: () => import('./components/testing/api-tester/api-tester.component').then(m => m.ApiTesterComponent),
    canActivate: [AuthGuard]
  }
];
