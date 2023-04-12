import { Track } from '@/lib/spotify';

export interface IframeTrackViewProps {
  track: Track;
}

export const IframeTrackView = ({ track }: IframeTrackViewProps) => {
  return (
    <iframe
      key={track.id}
      src={`https://open.spotify.com/embed/track/${track.id}`}
      style={{ borderStyle: 'none' }}
      height="80"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
};
