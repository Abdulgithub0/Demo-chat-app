'use client';

import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import ChatApp from '@/components/ChatApp';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const handleLogin = (userId: string) => {
    setUserId(userId);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUserId('');
    setIsAuthenticated(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <ChatApp userId={userId} onLogout={handleLogout} />
      )}
    </main>
  );
}
