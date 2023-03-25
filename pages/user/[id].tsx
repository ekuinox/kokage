import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type TopTracksData } from '../api/[id]/top-tracks';
import { Track } from '@/lib/spotify';
import { useSession } from 'next-auth/react';
import {
  CreatePlaylistResponse,
  type CreatePlaylistRequest,
} from '../api/create-playlist';

const getTopTracks = async (id: string): Promise<TopTracksData> => {
  const resp = await fetch(`/api/${id}/top-tracks`);
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  return resp.json();
};

const PlaylistCreator = ({ tracks }: { tracks: Track[] }) => {
  const session = useSession();
  const [playlistName, setPlaylistName] = useState<string | null>(null);

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
        setPlaylistName(data.playlist.name);
      }
    });
  }, [tracks]);

  if (session.data == null) {
    return <>Not logined</>;
  }

  return (
    <>
      <button onClick={create}>まとめてプレイリストに登録する</button>
      {playlistName && <p>{playlistName} created.</p>}
    </>
  );
};

export default function Home() {
  const router = useRouter();
  const [resp, setResp] = useState<TopTracksData | null>(null);

  useEffect(() => {
    const { id } = router.query;
    if (typeof id === 'string') {
      getTopTracks(id).then(setResp);
    }
  }, [router.query]);

  const topTracks = useMemo(() => resp?.topTracks ?? [], [resp]);
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
        <h1>{user?.name}</h1>
        <PlaylistCreator tracks={topTracks} />
        <ul>
          {topTracks.map((track) => (
            <li key={track.id}>
              <img src={track.album.images[0].url} style={{ width: '10rem' }} />
              <a href={track.external_urls['spotify']}>
                {track.artists.map((artist) => artist.name).join(', ')} -{' '}
                {track.name}
              </a>
            </li>
          ))}
        </ul>
        <Link href="/">/</Link>
      </main>
    </>
  );
}
