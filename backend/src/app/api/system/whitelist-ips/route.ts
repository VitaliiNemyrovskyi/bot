import { NextResponse } from 'next/server';

/**
 * GET /api/system/whitelist-ips
 *
 * Returns the list of outbound server IPs the user must whitelist on their
 * exchange API key. The list is read from the WHITELIST_IPS env var
 * (comma-separated). Public endpoint — no auth required so the onboarding
 * page can render before the user has connected anything.
 *
 * Per project policy, the IP list is never hardcoded. If WHITELIST_IPS is
 * not configured we return an empty array and the frontend can show a
 * fallback message.
 */
export function GET() {
  const raw = process.env.WHITELIST_IPS ?? '';
  const ips = raw
    .split(',')
    .map((ip) => ip.trim())
    .filter((ip) => ip.length > 0);

  return NextResponse.json({
    success: true,
    data: { ips }
  });
}
