import { UserTopTracksProps } from '@/components/UserTopTracks';
import dayjs from 'dayjs';
import { GetServerSideProps } from 'next';
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

export const getServerSideUserTopTracksProps = async (
  id: string
): Promise<UserTopTracksProps | null> => {
  const [, client] = await getClient(id).catch(() => [null, null]);
  if (client == null) {
    return null;
  }

  const profile = await client.getUserProfile(id);
  const profileImage = profile.images.sort(
    (a, b) => b.width ?? 0 - (a.width ?? 0)
  )[0].url;
  const profileUrl = profile.external_urls['spotify'];

  const timeRanges = ['short', 'medium', 'long'] as const;
  const [short, medium, long] = await Promise.all(
    timeRanges.map((timeRange) =>
      client.getTopTracks({ limit: 5, offset: 0, timeRange }).then((r) => {
        if ('error' in r) {
          throw new Error(`Error with ${timeRange}`);
        }
        return r.items;
      })
    )
  );

  return {
    topTracks: {
      short,
      medium,
      long,
    },
    user: {
      id,
      name: profile.display_name,
      image: profileImage,
      url: profileUrl,
    },
  };
};

export const createGetServerSidePropsFunc =
  (id_?: string): GetServerSideProps<UserTopTracksProps> =>
  async (context) => {
    const id = id_ ?? context.params?.id;

    if (typeof id !== 'string') {
      return {
        notFound: true,
      };
    }

    const [, client] = await getClient(id).catch(() => [null, null]);
    if (client == null) {
      return {
        notFound: true,
      };
    }

    const profile = await client.getUserProfile(id);
    const profileImage = profile.images.sort(
      (a, b) => b.width ?? 0 - (a.width ?? 0)
    )[0].url;
    const profileUrl = profile.external_urls['spotify'];

    const timeRanges = ['short', 'medium', 'long'] as const;
    const [short, medium, long] = await Promise.all(
      timeRanges.map((timeRange) =>
        client.getTopTracks({ limit: 5, offset: 0, timeRange }).then((r) => {
          if ('error' in r) {
            throw new Error(`Error with ${timeRange}`);
          }
          return r.items;
        })
      )
    );

    return {
      props: {
        topTracks: {
          short,
          medium,
          long,
        },
        user: {
          id,
          name: profile.display_name,
          image: profileImage,
          url: profileUrl,
        },
      },
    };
  };
