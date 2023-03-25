import dayjs from 'dayjs';
import { SpotifyClient } from './spotify';
import { getUserByIdPrivate, upsertUser } from './supabase';

export const getClient = async (
  id: string
): Promise<[name: string, client: SpotifyClient]> => {
  const {
    name,
    tokens: {
      accessToken: accessTokenOld,
      refreshToken,
      expiresAt: expiresAtOld,
      scopes: scopesOld,
    },
  } = await getUserByIdPrivate(id);

  // 現在時刻の1分後でもaccessTokenが生きている場合はそのままClient作って返す
  const afterOneMinute = dayjs().add(1, 'minute');
  if (afterOneMinute < dayjs(expiresAtOld)) {
    return [
      name,
      new SpotifyClient(accessTokenOld, refreshToken, expiresAtOld, scopesOld),
    ];
  }

  console.log(`start token refresh id=${id}`);

  // accessTokenがキレそうであれば新しくしてから返す
  const spotify = await SpotifyClient.fromRefreshToken(refreshToken, {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  const accessToken = spotify.getAccessToken();
  const expiresAt = spotify.getExpiresAt();
  const scopes = spotify.getScopes();

  if (expiresAt == null || scopes == null) {
    throw new Error('expiresAt or scopes are null');
  }

  await upsertUser({
    id,
    name,
    tokens: {
      accessToken,
      refreshToken,
      expiresAt,
      scopes,
    },
  });

  return [name, spotify];
};
