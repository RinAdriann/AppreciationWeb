'use client';

import { useState, useEffect } from 'react';
import PasswordGate from '@/components/PasswordGate';
import JourneyTree from '@/components/JourneyTree';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedToken = sessionStorage.getItem('journey_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {!token ? (
        <PasswordGate onSuccess={setToken} />
      ) : (
        <JourneyTree token={token} />
      )}
    </>
  );
}