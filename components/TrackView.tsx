import {
  Anchor,
  AspectRatio,
  Card,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  createStyles,
  rem,
} from '@mantine/core';
import { Track } from '@/lib/spotify';
import Link from 'next/link';

const useStyles = createStyles(() => ({
  card: {
    backgroundColor: 'rgba(0,0,0, 0.05)',
  },
}));

export interface TrackViewTrackProps {
  track: Track;
}

export const TrackView = ({ track }: TrackViewTrackProps) => {
  const { classes } = useStyles();

  return (
    <Card shadow="sm" radius="md" withBorder className={classes.card}>
      <Card.Section>
        <Group position="left" grow spacing={rem(10)}>
          <AspectRatio
            ratio={track.album.images[0].width / track.album.images[0].height}
            maw="70px"
          >
            <Image src={track.album.images[0].url} alt={track.name} />
          </AspectRatio>
          <Stack align="left" spacing={rem(1)}>
            <Anchor
              fz="lg"
              mr="auto"
              color="dark"
              truncate
              component={Link}
              href={track.external_urls['spotify']}
              target="_blank"
            >
              {track.name}
            </Anchor>
            <Text fz="sm" mr="auto" truncate>
              {track.artists.map(({ name, external_urls }, i) => (
                <>
                  <Anchor
                    key={name}
                    color="dark"
                    href={external_urls['spotify']}
                    component={Link}
                    target="_blank"
                  >
                    {name}
                  </Anchor>
                  {i + 1 < track.artists.length && ', '}
                </>
              ))}
            </Text>
          </Stack>
        </Group>
      </Card.Section>
    </Card>
  );
};
