import Link from 'next/link';
import { useEffect, useState } from 'react';

const LoginPage = () => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    (async () => {
      const response = await fetch('/api/login');
      const { url } = await response.json();
      setUrl(url);
    })();
  }, []);
  return (
    <>
      <Link href={url}>{url}</Link>
    </>
  );
};

export default LoginPage;
