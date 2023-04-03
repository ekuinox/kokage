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
  IconMusic,
  IconBrandGithub,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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
  source: {
    '&:hover': {
      transform: 'scaleX(-1)',
    },
  },
}));

export function Header() {
  const { classes, theme, cx } = useStyles();
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
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <ActionIcon
                component={Link}
                target="_blank"
                className={classes.source}
                href="https://github.com/ekuinox/kokage"
              >
                <IconBrandGithub />
              </ActionIcon>
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
                    icon={
                      <IconUser
                        size="0.9rem"
                        stroke={1.5}
                      />
                    }
                  >
                    Top tracks
                  </Menu.Item>
                )}
                <Menu.Label>Settings</Menu.Label>
                {status === 'authenticated' && (
                  <Menu.Item
                    component={Link}
                    href="/api/auth/signout"
                    icon={<IconLogout size="0.9rem" stroke={1.5} />}
                  >
                    Sign out
                  </Menu.Item>
                )}
                {status === 'unauthenticated' && (
                  <Menu.Item
                    component={Link}
                    href="/api/auth/signin"
                    icon={<IconLogin size="0.9rem" stroke={1.5} />}
                  >
                    Sign in
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Container>
    </div>
  );
}
