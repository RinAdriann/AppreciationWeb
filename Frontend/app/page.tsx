'use client';

import { useState, useEffect } from 'react';
import PasswordGate from '@/components/PasswordGate';
import JourneyView from '@/components/JourneyView';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check for existing token
    const savedToken = sessionStorage.getItem('journey_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  return (
    <>
      {!token ? (
        <PasswordGate onSuccess={setToken} />
      ) : (
        <JourneyView token={token} />
      )}
    </>
  );
}