/**
 * Alert Service
 *
 * Sends critical alerts when positions enter ERROR state, recovery fails,
 * or capital is at risk. Supports multiple channels:
 * - Console (always enabled)
 * - Webhook (Slack, Discord, etc.) via ALERT_WEBHOOK_URL env var
 *
 * Usage:
 *   import { alertService } from '@/services/alert.service';
 *   alertService.critical('Position stuck in EXECUTING', { positionId, exchange });
 */

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export interface AlertPayload {
  severity: AlertSeverity;
  title: string;
  details: Record<string, unknown>;
  timestamp: string;
  source: string;
}

class AlertService {
  private readonly webhookUrl: string | undefined;

  constructor() {
    this.webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (this.webhookUrl) {
      console.log(`[AlertService] Webhook alerting enabled`);
    } else {
      console.log(`[AlertService] No ALERT_WEBHOOK_URL set — console-only alerting`);
    }
  }

  async critical(title: string, details: Record<string, unknown> = {}): Promise<void> {
    await this.send(AlertSeverity.CRITICAL, title, details);
  }

  async warning(title: string, details: Record<string, unknown> = {}): Promise<void> {
    await this.send(AlertSeverity.WARNING, title, details);
  }

  async info(title: string, details: Record<string, unknown> = {}): Promise<void> {
    await this.send(AlertSeverity.INFO, title, details);
  }

  private async send(
    severity: AlertSeverity,
    title: string,
    details: Record<string, unknown>
  ): Promise<void> {
    const payload: AlertPayload = {
      severity,
      title,
      details,
      timestamp: new Date().toISOString(),
      source: 'execution-engine',
    };

    // Always log to console
    const prefix = severity === AlertSeverity.CRITICAL
      ? '[ALERT][CRITICAL]'
      : severity === AlertSeverity.WARNING
        ? '[ALERT][WARNING]'
        : '[ALERT][INFO]';

    console.error(`${prefix} ${title}`, JSON.stringify(details));

    // Send to webhook if configured
    if (this.webhookUrl) {
      try {
        await this.sendWebhook(payload);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[AlertService] Webhook delivery failed: ${msg}`);
      }
    }
  }

  private async sendWebhook(payload: AlertPayload): Promise<void> {
    if (!this.webhookUrl) return;

    // Format for Slack-compatible webhooks
    const body = JSON.stringify({
      text: `${payload.severity}: ${payload.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${payload.severity}*: ${payload.title}\n` +
              `_${payload.timestamp}_ | source: \`${payload.source}\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '```' + JSON.stringify(payload.details, null, 2) + '```',
          },
        },
      ],
    });

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }
  }
}

export const alertService = new AlertService();
