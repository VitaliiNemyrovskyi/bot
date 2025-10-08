import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.FRONTEND_URL
);

export interface GoogleUserInfo {
  sub: string; // Google ID
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

export class GoogleAuthService {
  static async verifyIdToken(idToken: string): Promise<GoogleUserInfo | null> {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) return null;

      return {
        sub: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture!,
        email_verified: payload.email_verified!,
      };
    } catch (error) {
      console.error('Google ID token verification failed:', error);
      return null;
    }
  }

  static getAuthUrl(state?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.FRONTEND_URL}/auth/google/callback`,
      scope: scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  static async getTokenFromCode(code: string) {
    try {
      const { tokens } = await client.getToken({
        code,
        redirect_uri: `${process.env.FRONTEND_URL}/auth/google/callback`,
      });

      return tokens;
    } catch (error) {
      console.error('Failed to exchange code for tokens:', error);
      return null;
    }
  }
}