/* eslint-disable no-prototype-builtins */
import { useEffect } from 'react';

export const useAuth = () => {
  const handleWindowEventsFromStudio = (event: MessageEvent): void => {
    // if (event.origin !== import.meta.env.VITE_STUDIO_HOST) return;

    if (event?.data?.hasOwnProperty('accessToken')) {
      const payload = event.data;
      //token payload received successfully
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleWindowEventsFromStudio);
    return () => window.removeEventListener('message', handleWindowEventsFromStudio);
  }, []);
};
