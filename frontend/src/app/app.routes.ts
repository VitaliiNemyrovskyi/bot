import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { OnboardingGuard } from './guards/onboarding.guard';
import { SubscriptionGuard } from './guards/subscription.guard';

export const routes: Routes = [
  // Standalone pages (no sidebar shell)
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.OnboardingComponent),
    canActivate: [AuthGuard]
  },

  // Authenticated shell with sidebar
  {
    path: '',
    loadComponent: () => import('./components/layout/authenticated-layout.component').then(m => m.AuthenticatedLayoutComponent),
    canActivate: [AuthGuard, OnboardingGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'trading/manual',
        loadComponent: () => import('./components/trading/trading-dashboard/trading-dashboard.component').then(m => m.TradingDashboardComponent)
      },
      {
        path: 'trading/bot/create',
        loadComponent: () => import('./components/trading/bot-config-page/bot-config-page.component').then(m => m.BotConfigPageComponent),
        data: { mode: 'create' }
      },
      {
        path: 'trading/bot/edit/:id',
        loadComponent: () => import('./components/trading/bot-config-page/bot-config-page.component').then(m => m.BotConfigPageComponent),
        data: { mode: 'edit' }
      },
      {
        path: 'trading/bot/view/:id',
        loadComponent: () => import('./components/trading/bot-config-page/bot-config-page.component').then(m => m.BotConfigPageComponent),
        data: { mode: 'view' }
      },
      {
        path: 'arbitrage/funding',
        loadComponent: () => import('./pages/arbitrage-funding/arbitrage-funding.component').then(m => m.ArbitrageFundingComponent),
      },
      {
        path: 'arbitrage/chart/:symbol/:primary/:hedge/:strategy',
        loadComponent: () => import('./components/trading/arbitrage-chart/arbitrage-chart.component').then(m => m.ArbitrageChartComponent)
      },
      {
        path: 'arbitrage/chart/:symbol/:primary/:hedge',
        loadComponent: () => import('./components/trading/arbitrage-chart/arbitrage-chart.component').then(m => m.ArbitrageChartComponent)
      },
      {
        path: 'arbitrage/positions',
        loadComponent: () => import('./pages/active-arbitrage-positions/active-arbitrage-positions.component').then(m => m.ActiveArbitragePositionsComponent)
      },
      {
        path: 'arbitrage/opportunities',
        loadComponent: () => import('./pages/price-arbitrage-opportunities/price-arbitrage-opportunities.component').then(m => m.PriceArbitrageOpportunitiesComponent),
        canActivate: [SubscriptionGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'billing',
        loadComponent: () => import('./pages/billing/billing.component').then(m => m.BillingComponent)
      },
      {
        path: 'chart-demo',
        loadComponent: () => import('./components/chart-demo/chart-demo.component').then(m => m.ChartDemoComponent)
      },
      {
        path: 'testing/api-tester',
        loadComponent: () => import('./components/testing/api-tester/api-tester.component').then(m => m.ApiTesterComponent)
      },
      {
        path: 'execution-metrics',
        loadComponent: () => import('./pages/execution-metrics/execution-metrics.component').then(m => m.ExecutionMetricsComponent)
      }
    ]
  },

  // 404 catch-all
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
