import { Track } from '@/lib/spotify';

export interface IframedTracksProps {
  tracks: Track[];
}

export const IframedTracks = ({ tracks }: IframedTracksProps) => {
  return (
    <>
      {tracks.map((track) => (
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
    </>
  );
};
