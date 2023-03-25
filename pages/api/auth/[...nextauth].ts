import { SpotifyClient } from '@/lib/spotify';
import { upsertUser } from '@/lib/supabase';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import SpotifyProvider from 'next-auth/providers/spotify';

interface Token {
  refreshToken: string;
}

//NextAuth Refresh Token Rotationからコピー。
/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT) {
  try {
    if (token.refreshToken == null) {
      return {
        ...token,
        error: 'RefreshTokenEmptyError',
      };
    }

    const url = new URL('https://accounts.spotify.com/api/token');
    url.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID);
    url.searchParams.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET);
    url.searchParams.append('grant_type', 'refresh_token');
    url.searchParams.append('refresh_token', token.refreshToken);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const scopes = [
  'user-top-read',
  'user-read-private',
  'user-read-email',
  'user-read-currently-playing',
  'user-read-recently-played',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'playlist-modify-public',
];

export const authOptions: NextAuthOptions = {
  // 1つまたは複数の認証プロバイダを設定する
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        url: 'https://accounts.spotify.com/authorize',
        params: {
          scope: scopes.join(','),
        },
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, account, user }) => {
      if (account && user) {
        const {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAtSecs,
          scope,
        } = account;
        const { id, name } = user;

        if (
          accessToken &&
          refreshToken &&
          expiresAtSecs &&
          scope &&
          id &&
          name
        ) {
          const scopes = scope.split(' ');
          const expiresAt = expiresAtSecs * 1000;

          await upsertUser({
            id,
            name,
            tokens: {
              accessToken,
              refreshToken,
              expiresAt: new Date(expiresAt),
              scopes,
            },
          });

          return {
            accessToken,
            refreshToken,
            expiresAt,
            scopes,
            user,
            token,
          };
        }

        throw new Error('accessToken or refreshToken or expiresAt are none');
      }

      // アクセストークンが切れていなければ前のを返す
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token;
      }

      const { refreshToken, ...tokenRest } = token;
      if (refreshToken == null) {
        return {
          ...token,
          error: 'RefreshTokenEmptyError',
        };
      }

      const client = await SpotifyClient.fromRefreshToken(refreshToken, {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      });

      const accessToken = client.getAccessToken();
      const expiresAt = client.getExpiresAt();
      const scopes = client.getScopes();

      if (expiresAt == null || scopes == null) {
        return {
          ...token,
          error: 'TokenRefreshError',
        };
      }

      await upsertUser({
        id: token.token.sub as string,
        name: token.token.name as string,
        tokens: {
          accessToken,
          refreshToken,
          expiresAt,
          scopes,
        },
      });

      return {
        accessToken,
        refreshToken,
        expiresAt: expiresAt.getTime(),
        ...tokenRest,
      };
    },
    session: async ({ session, token: { user } }) => {
      session.user = user;
      return session;
    },
  },
};

export default NextAuth(authOptions);
