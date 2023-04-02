import NextHead from 'next/head';

export const Head = () => {
  return (
    <NextHead>
      <title>よく聴く曲をシェアするやつ</title>
      <meta name="description" content="よく聴く曲をシェアするやつ" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </NextHead>
  );
};
