import {
  Indicator,
  ActionIcon,
  Popover,
  Anchor,
  rem,
  Code,
  SegmentedControl,
  Text,
} from '@mantine/core';
import { IconHelpCircle } from '@tabler/icons-react';
import { TimeRange } from './PlaylistCreateButton';

export interface TimeRangeControlProps {
  value: TimeRange;
  onChange: (timeRange: TimeRange) => void;
}

export const TimeRangeControl = ({
  value,
  onChange,
}: TimeRangeControlProps) => {
  return (
    <Indicator
      label={
        <ActionIcon component={Popover}>
          <Popover.Target>
            <IconHelpCircle />
          </Popover.Target>
          <Popover.Dropdown>
            <Text c="black" fz="md">
              集計の期間を選択します
              <Anchor
                fz="sm"
                mx={rem(5)}
                href="https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks"
                target="_blank"
              >
                {"[Get User's Top Items]"}
              </Anchor>
            </Text>
          </Popover.Dropdown>
        </ActionIcon>
      }
      styles={{
        indicator: {
          backgroundColor: 'rgba(0, 0, 0, 0)',
        },
      }}
    >
      <SegmentedControl
        data={[
          { label: '4 weeks', value: 'short' },
          { label: '6 months', value: 'medium' },
          { label: 'All', value: 'long' },
        ]}
        value={value}
        onChange={(value) => onChange(value as TimeRange)}
      />
    </Indicator>
  );
};
