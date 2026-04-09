import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { BillingService, BillingPlan } from '../../services/billing.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

/**
 * Billing / pricing page.
 *
 * Shows available plans (loaded from /api/billing/plans), the user's current
 * subscription status, and a Pay-with-Crypto CTA that creates a NOWPayments
 * invoice and full-page-redirects to the hosted checkout.
 */
@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DatePipe],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss'
})
export class BillingComponent implements OnInit {
  private readonly billingService = inject(BillingService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly translationService = inject(TranslationService);

  readonly plans = this.billingService.plans;
  readonly loading = this.billingService.loading;
  readonly error = this.billingService.error;
  readonly creatingInvoiceFor = signal<string | null>(null);

  readonly currentUser = this.authService.currentUser;
  readonly isSubscribed = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    if (!user.subscriptionActive) return false;
    if (!user.subscriptionExpiry) return true;
    return new Date(user.subscriptionExpiry).getTime() > Date.now();
  });

  readonly bannerReason = signal<string | null>(null);
  readonly paymentStatus = signal<string | null>(null);

  ngOnInit(): void {
    this.billingService.fetchPlans().subscribe();

    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'subscription_required') {
      this.bannerReason.set(this.translate('billing.subscriptionRequired'));
    }
    const status = this.route.snapshot.queryParamMap.get('status');
    if (status === 'success') {
      this.paymentStatus.set(this.translate('billing.paymentPending'));
    }
  }

  translate(key: string, params?: Record<string, string>): string {
    return this.translationService.translate(key, params);
  }

  onUpgrade(plan: BillingPlan): void {
    this.creatingInvoiceFor.set(plan.id);
    this.billingService.createInvoice(plan.id).subscribe({
      next: ({ invoiceUrl }) => {
        // Hard redirect to NOWPayments hosted checkout
        window.location.href = invoiceUrl;
      },
      error: () => {
        this.creatingInvoiceFor.set(null);
      }
    });
  }

  pricePerMonth(plan: BillingPlan): string {
    if (plan.duration <= 31) return `$${plan.price.toFixed(0)}/mo`;
    const months = plan.duration / 30;
    return `$${(plan.price / months).toFixed(2)}/mo`;
  }
}
