/* eslint-disable @next/next/no-img-element */
import { getClient } from '@/lib';
import { SpotifyClient, Track } from '@/lib/spotify';
import { ImageResponse } from '@vercel/og';
import { NextApiHandler } from 'next';

export const config = {
  runtime: 'edge',
};

const TrackView = ({ track }: { track: Track }) => {
  const joinedArtist = track.artists.map(({ name }) => name).join(', ');
  return (
    <div tw="flex flex-row">
      <div tw="flex">
        <img
          tw="w-40 rounded-lg shadow-2xl"
          src={track.album.images[0].url}
          alt={track.name}
        />
      </div>
      <div
        tw="flex flex-col my-auto min-w-70 max-w-100"
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <p
          tw="text-2xl mx-5 my-auto"
          style={{
            textOverflow: 'ellipsis',
          }}
        >
          {track.name}
        </p>
        <p
          tw="text-xl mx-10 my-auto"
          style={{
            textOverflow: 'ellipsis',
          }}
        >
          {joinedArtist}
        </p>
      </div>
    </div>
  );
};

const backgroundImage = `
<svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><path d="M0 157L60 157L60 193L120 193L120 205L180 205L180 193L240 193L240 169L300 169L300 175L360 175L360 235L420 235L420 241L480 241L480 175L540 175L540 241L600 241L600 127L660 127L660 307L720 307L720 187L780 187L780 235L840 235L840 229L900 229L900 157L900 0L900 0L840 0L840 0L780 0L780 0L720 0L720 0L660 0L660 0L600 0L600 0L540 0L540 0L480 0L480 0L420 0L420 0L360 0L360 0L300 0L300 0L240 0L240 0L180 0L180 0L120 0L120 0L60 0L60 0L0 0Z" fill="#c1e6de"></path><path d="M0 331L60 331L60 433L120 433L120 409L180 409L180 367L240 367L240 331L300 331L300 427L360 427L360 367L420 367L420 415L480 415L480 361L540 361L540 397L600 397L600 343L660 343L660 457L720 457L720 427L780 427L780 391L840 391L840 403L900 403L900 397L900 155L900 227L840 227L840 233L780 233L780 185L720 185L720 305L660 305L660 125L600 125L600 239L540 239L540 173L480 173L480 239L420 239L420 233L360 233L360 173L300 173L300 167L240 167L240 191L180 191L180 203L120 203L120 191L60 191L60 155L0 155Z" fill="#9ee2d3"></path><path d="M0 457L60 457L60 529L120 529L120 529L180 529L180 427L240 427L240 433L300 433L300 487L360 487L360 493L420 493L420 493L480 493L480 469L540 469L540 523L600 523L600 451L660 451L660 523L720 523L720 499L780 499L780 505L840 505L840 523L900 523L900 511L900 395L900 401L840 401L840 389L780 389L780 425L720 425L720 455L660 455L660 341L600 341L600 395L540 395L540 359L480 359L480 413L420 413L420 365L360 365L360 425L300 425L300 329L240 329L240 365L180 365L180 407L120 407L120 431L60 431L60 329L0 329Z" fill="#78ddc7"></path><path d="M0 601L60 601L60 601L120 601L120 601L180 601L180 601L240 601L240 601L300 601L300 601L360 601L360 601L420 601L420 601L480 601L480 601L540 601L540 601L600 601L600 601L660 601L660 601L720 601L720 601L780 601L780 601L840 601L840 601L900 601L900 601L900 509L900 521L840 521L840 503L780 503L780 497L720 497L720 521L660 521L660 449L600 449L600 521L540 521L540 467L480 467L480 491L420 491L420 491L360 491L360 485L300 485L300 431L240 431L240 425L180 425L180 527L120 527L120 527L60 527L60 455L0 455Z" fill="#48d8b9"></path></svg>
`;

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
      <div
        tw="flex w-full h-full"
        style={{
          backgroundImage: `url(${`data:image/svg+xml,${encodeURIComponent(
            backgroundImage.trim()
          )}`})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '100% 100%',
        }}
      >
        <div tw="flex flex-col my-0 mx-auto">
          <div tw="flex flex-row-reverse">
            <p tw="text-xl">kokage.ekuinox.dev</p>
          </div>
          <p tw="text-xl">{name}が最近よく再生した曲は...</p>
          {tracks.map((track, i) => (
            <div tw={`flex ml-${i * 70}`} key={track.id}>
              <TrackView track={track} />
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 627,
    }
  );
};

export default handler;
