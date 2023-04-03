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
import { IconQuestionMark } from '@tabler/icons-react';
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
        <ActionIcon
          component={Popover}
          size={24}
          style={{
            borderStyle: 'solid',
            borderColor: 'black',
            borderRadius: '20px',
          }}
        >
          <Popover.Target>
            <IconQuestionMark />
          </Popover.Target>
          <Popover.Dropdown>
            <Text c="black" fz="md">
              <Anchor
                mx={rem(5)}
                href="https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks"
                target="_blank"
              >
                Get User's Top Items
              </Anchor>
              の<Code>time_range</Code>にもとづきます
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
