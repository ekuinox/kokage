import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <MantineProvider withNormalizeCSS withGlobalStyles>
        <Notifications />
        <Component {...pageProps} />
      </MantineProvider>
    </SessionProvider>
  );
}
