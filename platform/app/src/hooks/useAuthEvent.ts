import { useEffect, useState } from 'react';

export const useAuthEvent = () => {
  const [token, setToken] = useState('');

  const handleWindowEventsFromHost = (event: MessageEvent): void => {
    // if (event.origin !== import.meta.env.VITE_STUDIO_HOST) return;

    // eslint-disable-next-line no-prototype-builtins
    if (event?.data?.hasOwnProperty('accessToken')) {
      const payload = event.data;
      setToken(payload);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleWindowEventsFromHost);
    return () => window.removeEventListener('message', handleWindowEventsFromHost);
  }, []);
};
