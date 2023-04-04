import { Container } from '@mantine/core';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Head } from '@/components/Head';
import { Header } from '@/components/Header';
import { UserTopTracks, UserTopTracksProps } from '@/components/UserTopTracks';
import { getServerSideUserTopTracksProps } from '@/lib';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

type UserPageProps = UserTopTracksProps & { baseUrl: string };

export const getServerSideProps: GetServerSideProps<UserPageProps> = async (
  context
) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  const protocol = context.req.headers['x-forwarded-proto'] ?? 'http';
  const host = context.req.headers.host ?? '';
  const baseUrl = `${protocol}://${host}`;

  const id = context.params?.id;

  if (typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  const props = await getServerSideUserTopTracksProps(id);
  if (props == null) {
    return { notFound: true };
  }
  return { props: { ...props, isSelf: session?.user?.id === id, baseUrl } };
};

export default function UserPage({
  user,
  topTracks,
  isSelf,
  baseUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head
        ogUrl={`${baseUrl}/user/${user.id}`}
        ogImg={{
          url: `${baseUrl}/api/user/${user.id}/og`,
          width: 1200,
          height: 600,
        }}
      />
      <main>
        <Header />
        <Container my="sm">
          <UserTopTracks user={user} topTracks={topTracks} isSelf={isSelf} />
        </Container>
      </main>
    </>
  );
}
