import Link from 'next/link';
import { useState } from 'react';
import {
  createStyles,
  Container,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Burger,
  rem,
  Title,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLogout,
  IconChevronDown,
  IconLogin,
  IconUser,
  IconExternalLink,
} from '@tabler/icons-react';
import { signIn, signOut, useSession } from 'next-auth/react';

const useStyles = createStyles((theme) => ({
  header: {
    paddingTop: theme.spacing.sm,
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[2]
    }`,
  },
  mainSection: {
    paddingBottom: theme.spacing.sm,
  },
  user: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    borderRadius: theme.radius.sm,
    transition: 'background-color 100ms ease',
    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    },
  },
  burger: {
    display: 'none',
  },
  userActive: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
  },
}));

export function Header() {
  const { classes, cx } = useStyles();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection}>
        <Group position="apart" mx="xl">
          <ActionIcon component={Link} href="/">
            <Title fz="lg">Kokage</Title>
          </ActionIcon>
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
          />
          <Group>
            <Menu
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.user, {
                    [classes.userActive]: userMenuOpened,
                  })}
                >
                  {(user && (
                    <Group spacing={7}>
                      <Avatar src={user.image} radius="xl" size={20} />
                      <Text
                        weight={500}
                        size="sm"
                        sx={{ lineHeight: 1 }}
                        mr={3}
                      >
                        {user.name}
                      </Text>
                      <IconChevronDown size={rem(12)} stroke={1.5} />
                    </Group>
                  )) || <IconUser size={20} stroke={1.5} />}
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {user?.id && (
                  <Menu.Item
                    component={Link}
                    href={`/user/${user?.id}`}
                    icon={<IconUser stroke={1.5} />}
                  >
                    Top tracks
                  </Menu.Item>
                )}
                <Menu.Label>Settings</Menu.Label>
                {status === 'authenticated' && (
                  <Menu.Item
                    component="button"
                    onClick={() => signOut()}
                    icon={<IconLogout stroke={1.5} />}
                  >
                    sign out
                  </Menu.Item>
                )}
                {status === 'unauthenticated' && (
                  <Menu.Item
                    component="button"
                    onClick={() => signIn('spotify')}
                    icon={<IconLogin stroke={1.5} />}
                  >
                    sign in
                  </Menu.Item>
                )}
                <Menu.Label>Kokage</Menu.Label>
                <Menu.Item
                  component={Link}
                  target="_blank"
                  href="https://github.com/ekuinox/kokage"
                >
                  <Group spacing="xs">
                    <Text fz="sm">source code at github</Text>
                    <IconExternalLink stroke={1.5} size="1rem" />
                  </Group>
                </Menu.Item>
                <Menu.Item
                  component={Link}
                  target="_blank"
                  href="https://twitter.com/remokusu"
                >
                  <Group spacing="xs">
                    <Text fz="sm">contact on twitter</Text>
                    <IconExternalLink stroke={1.5} size="1rem" />
                  </Group>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Container>
    </div>
  );
}
