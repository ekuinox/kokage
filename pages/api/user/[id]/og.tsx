/* eslint-disable @next/next/no-img-element */
import { getClient } from '@/lib';
import { SpotifyClient, Track } from '@/lib/spotify';
import { ImageResponse } from '@vercel/og';
import { NextApiHandler } from 'next';

export const config = {
  runtime: 'edge',
};

const TrackView = ({ track }: { track: Track }) => {
  const joinedName = `${track.artists.map(({ name }) => name).join(', ')} - ${
    track.name
  }`;
  return (
    <div tw="flex flex-row mx-10 my-3">
      <div tw="flex shadow-2xl">
        <img
          tw="w-40 rounded-lg"
          src={track.album.images[0].url}
          alt={joinedName}
        />
      </div>
      <p tw="text-2xl mx-10 my-auto">{joinedName}</p>
    </div>
  );
};

const handler: NextApiHandler = async (req) => {
  if (req.url == null) {
    return new Response(null, { status: 400 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (id == null) {
    return new Response(null, { status: 400 });
  }

  let client: SpotifyClient;
  let name: string;
  try {
    const [name_, client_] = await getClient(id);
    client = client_;
    name = name_;
  } catch (e) {
    return new Response(null, { status: 404 });
  }

  const resp = await client.getTopTracks({
    limit: 3,
    offset: 0,
    timeRange: 'short',
  });

  if ('error' in resp) {
    return new Response(null, { status: 500 });
  }

  const tracks = resp.items.slice(0, 3);

  return new ImageResponse(
    (
      <div tw="flex w-full h-full bg-green-100">
        <div tw="flex flex-col my-1 mx-auto">
          <p tw="text-xl my-auto">{name}が最近よく再生した曲は...</p>
          {tracks.map((track) => (
            <TrackView key={track.id} track={track} />
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
    }
  );
};

export default handler;
