import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Track } from '@/lib/spotify';
import { Header } from '@/components/Header';
import { useSession } from 'next-auth/react';
import {
  CreatePlaylistResponse,
  type CreatePlaylistRequest,
} from '../api/create-playlist';
import {
  ActionIcon,
  Avatar,
  Center,
  Container,
  Divider,
  Group,
  rem,
  SegmentedControl,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';

interface Data {
  topTracks: {
    long: Track[];
    short: Track[];
    medium: Track[];
  };
  user: {
    name: string;
    id: string;
    image: string;
  };
}

const getData = async (id: string): Promise<Data> => {
  const requestUrls = [
    `/api/${id}`,
    `/api/${id}/top-tracks?timeRange=short`,
    `/api/${id}/top-tracks?timeRange=medium`,
    `/api/${id}/top-tracks?timeRange=long`,
  ];

  const responses = await Promise.allSettled(
    requestUrls.map((url) =>
      fetch(url).then(async (r) => {
        if (!r.ok) {
          return Promise.reject(await r.text());
        }
        return r.json();
      })
    )
  );

  const [user, short, medium, long] = responses;
  if (
    user.status === 'rejected' ||
    short.status === 'rejected' ||
    medium.status === 'rejected' ||
    long.status === 'rejected'
  ) {
    throw new Error('uwaaa');
  }

  return {
    topTracks: {
      short: short.value.topTracks,
      medium: medium.value.topTracks,
      long: long.value.topTracks,
    },
    user: user.value,
  };
};

const PlaylistCreator = ({ tracks }: { tracks: Track[] }) => {
  const session = useSession();

  const create = useCallback(() => {
    if (tracks.length === 0) {
      return;
    }
    const request: CreatePlaylistRequest = {
      trackUris: tracks.map((track) => track.uri),
    };
    fetch('/api/create-playlist', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: { 'content-type': 'application/json' },
    }).then(async (resp) => {
      if (resp.ok) {
        const data: CreatePlaylistResponse = await resp.json();
        notifications.show({
          title: 'プレイリストを作成しました!',
          message: `${data.playlist.name}という名前で追加しました`,
        });
      }
    });
  }, [tracks]);

  return (
    <Tooltip label="プレイリストを作成する">
      <ActionIcon
        onClick={create}
        disabled={session === null}
        variant="filled"
        color="teal"
      >
        <IconDeviceFloppy />
      </ActionIcon>
    </Tooltip>
  );
};

export default function Home() {
  const router = useRouter();
  const [resp, setResp] = useState<Data | null>(null);

  useEffect(() => {
    const { id } = router.query;
    if (typeof id === 'string') {
      getData(id).then(setResp);
    }
  }, [router.query]);

  useEffect(() => {
    console.log({ resp });
  }, [resp]);

  const [term, setTerm] = useState<keyof Data['topTracks']>('short');

  const topTracks = useMemo(() => {
    if (resp?.topTracks == null) {
      return [];
    }
    return resp.topTracks[term];
  }, [resp, term]);
  const user = useMemo(() => resp?.user ?? null, [resp]);

  return (
    <>
      <Head>
        <title>Kokage</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header />
        <Container my="sm">
          <Stack>
            <Group position="apart" mx={rem(10)}>
              <Group>
                <Avatar src={user?.image} />
                <Title fz="md">{user?.name}</Title>
              </Group>
              <SegmentedControl
                data={[
                  { label: 'Short', value: 'short' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Long', value: 'long' },
                ]}
                value={term}
                onChange={(value) => setTerm(value as typeof term)}
              />
              <PlaylistCreator tracks={topTracks} />
            </Group>
            <Divider />
            {topTracks.map((track) => (
              <iframe
                key={track.id}
                src={`https://open.spotify.com/embed/track/${track.id}`}
                height="80"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              ></iframe>
            ))}
          </Stack>
        </Container>
      </main>
    </>
  );
}
