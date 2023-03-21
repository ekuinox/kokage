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
      <a href={url}>{url}</a>
    </>
  );
};

export default LoginPage;
