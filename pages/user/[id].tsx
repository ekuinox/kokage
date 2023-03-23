import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Track } from '@/lib/spotify';

export default function Home() {
  const router = useRouter();
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [id, setId] = useState<string>('');
  useEffect(() => {
    const { id } = router.query;
    if (typeof id !== 'string') {
      return;
    }
    setId(id);
    fetch(`/api/${id}/top-tracks`).then(async (r) => {
      if (r.status === 200) {
        setTopTracks((await r.json()).tracks);
      }
    });
  }, [router.query]);

  return (
    <>
      <Head>
        <title>Kokage</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>{id}</h1>
        <ul>
          {topTracks.map((track) => (
            <li key={track.id}>
              <img src={track.album.images[0].url} style={{ width: '10rem' }} />
              <a href={track.external_urls['spotify']}>
                {track.artists.map((artist) => artist.name).join(', ')} - {track.name}
              </a>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
