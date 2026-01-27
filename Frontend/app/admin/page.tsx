'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedToken = sessionStorage.getItem('admin_token');
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
        <AdminLogin onSuccess={setToken} />
      ) : (
        <AdminDashboard token={token} onLogout={() => {
          sessionStorage.removeItem('admin_token');
          setToken(null);
        }} />
      )}
    </>
  );
}