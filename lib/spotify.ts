// From https://github.com/ekuinox/kiite/blob/main/worker/src/spotify.ts

import * as z from 'zod';

const tokenResponseType = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
  })
  .transform(({ access_token, refresh_token }) => ({
    accessToken: access_token,
    refreshToken: refresh_token,
  }));

const refreshTokenResponseType = z
  .object({
    access_token: z.string(),
  })
  .transform(({ access_token }) => ({
    accessToken: access_token,
  }));

const getCurrentUsersProfileResponseType = z
  .object({
    country: z.string(),
    display_name: z.string(),
    id: z.string(),
  })
  .transform(({ display_name, ...rest }) => ({
    displayName: display_name,
    ...rest,
  }));

const imageType = z.object({
  width: z.number(),
  height: z.number(),
  url: z.string(),
});

const albumType = z.object({
  external_urls: z.record(z.string(), z.string()),
  href: z.string(),
  id: z.string(),
  images: z.array(imageType),
  name: z.string(),
  release_date: z.string(),

});

const artistType = z.object({
  external_urls: z.record(z.string(), z.string()),
  name: z.string(),
  href: z.string(),
  id: z.string(),
});

const trackType = z.object({
  id: z.string(),
  name: z.string(),
  album: albumType,
  artists: z.array(artistType),
  external_urls: z.record(z.string(), z.string()),
});

const errorResponseType = z.object({
  error: z.number(),
  message: z.string()
});

// ここだけエラーとorしているのはどうなんだ
const getCurrentlyPlayingTrackResponseType = z.union(
  [z
    .object({
      item: trackType,
      is_playing: z.boolean(),
    })
    .transform(({ is_playing, ...rest }) => ({
      isPlaying: is_playing,
      ...rest,
    })),
    errorResponseType
  ]);

const getUserTopTracksResponseType = z.union([
  z.object({
    items: z.array(trackType),
  }),
  errorResponseType,
]);

export type Track = z.infer<typeof trackType>;

interface SpotifyOAuth2AppCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class SpotifyClient {
  #accessToken: string;
  #refreshToken: string;
  constructor(accessToken: string, refreshToken: string) {
    this.#accessToken = accessToken;
    this.#refreshToken = refreshToken;
  }

  getAccessToken = (): string => this.#accessToken;

  getRefreshToken = (): string => this.#refreshToken;

  static generateAuthorizeUri = (
    state: string,
    scopes: ReadonlyArray<string>,
    { clientId, redirectUri }: Omit<SpotifyOAuth2AppCredentials, 'clientSecret'>
  ): string => {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('response_type', 'code');
    params.append('redirect_uri', redirectUri);
    params.append('scope', scopes.join(' '));
    params.append('state', state);
    const authorizeUri = `https://accounts.spotify.com/authorize?${params.toString()}`;

    return authorizeUri;
  };

  static fromCode = async (
    code: string,
    { clientId, clientSecret, redirectUri }: SpotifyOAuth2AppCredentials
  ): Promise<SpotifyClient> => {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);

    const response = await fetch(
      `https://accounts.spotify.com/api/token?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
      }
    );
    const json = await response.json();
    const { accessToken, refreshToken } = await tokenResponseType.parseAsync(
      json
    );
    return new SpotifyClient(accessToken, refreshToken);
  };

  static #asJson =
    <T extends z.ZodTypeAny>(typeObject: T) =>
      async (r: Response): Promise<z.infer<T>> => {
        const response = await r.json();
        return typeObject.parseAsync(response);
      };

  static fromRefreshToken = async (
    refreshToken: string,
    { clientId, clientSecret, redirectUri }: SpotifyOAuth2AppCredentials
  ): Promise<SpotifyClient> => {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    const { accessToken } = await fetch(
      `https://accounts.spotify.com/api/token?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
      }
    ).then(SpotifyClient.#asJson(refreshTokenResponseType));
    return new SpotifyClient(accessToken, refreshToken);
  };

  #headers = (): { Authorization: string } => ({
    Authorization: `Bearer ${this.#accessToken}`,
  });

  #request = async (
    method: string,
    path: string,
    params: Record<string, string | number> = {}
  ) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      query.set(key, value.toString());
    }
    return fetch(`https://api.spotify.com/v1${path}?${query.toString()}`, {
      headers: this.#headers(),
      method,
    });
  };

  #get = async (path: string, params: Record<string, string | number> = {}) => {
    return this.#request('GET', path, params);
  };

  #post = async (path: string, params: Record<string, string> = {}) => {
    return this.#request('POST', path, params);
  };

  getCurrentUsersProfile = async (): Promise<
    z.infer<typeof getCurrentUsersProfileResponseType>
  > => {
    return this.#get('/me').then(
      SpotifyClient.#asJson(getCurrentUsersProfileResponseType)
    );
  };

  getCurrentlyPlayingTrack = async (): Promise<
    z.infer<typeof getCurrentlyPlayingTrackResponseType>
  > => {
    return this.#get('/me/player/currently-playing')
      .then(SpotifyClient.#asJson(getCurrentlyPlayingTrackResponseType));
  };

  getTopTracks = async ({ limit, offset, timeRange }: {
    limit?: number;
    offset?: number;
    timeRange?: 'long' | 'short' | 'medium';
  } = {}) => {
    const params: Record<string, string | number> = {};
    if (timeRange != null) {
      params['time_range'] = `${timeRange}_term`;
    }
    if (limit != null) {
      params['limit'] = limit;
    }
    if (offset != null) {
      params['offset'] = offset;
    }

    return this.#get('/me/top/tracks', params)
      .then(SpotifyClient.#asJson(getUserTopTracksResponseType));
  }
}
