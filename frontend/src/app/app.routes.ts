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
    path: 'arbitrage/funding',
    loadComponent: () => import('./pages/arbitrage-funding/arbitrage-funding.component').then(m => m.ArbitrageFundingComponent)
    // No auth guard - public page using public exchange APIs
  },
  {
    path: 'arbitrage/chart/:symbol/:primary/:hedge/:strategy',
    loadComponent: () => import('./components/trading/arbitrage-chart/arbitrage-chart.component').then(m => m.ArbitrageChartComponent),
    canActivate: [AuthGuard]
  },
  {
    // Backwards compatibility - strategy parameter is optional
    path: 'arbitrage/chart/:symbol/:primary/:hedge',
    loadComponent: () => import('./components/trading/arbitrage-chart/arbitrage-chart.component').then(m => m.ArbitrageChartComponent),
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
  },
  {
    path: 'arbitrage/positions',
    loadComponent: () => import('./pages/active-arbitrage-positions/active-arbitrage-positions.component').then(m => m.ActiveArbitragePositionsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'arbitrage/opportunities',
    loadComponent: () => import('./pages/price-arbitrage-opportunities/price-arbitrage-opportunities.component').then(m => m.PriceArbitrageOpportunitiesComponent),
    canActivate: [AuthGuard]
  }
];
