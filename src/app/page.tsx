'use client';

import { useState } from 'react';
import ChatApp from '../components/ChatApp';

export default function Home() {
  const [externalId, setExternalId] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (externalId.trim()) {
      setIsLoggedIn(true);
    }
  };

  return (
    <main className="min-h-screen">
      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6">Sparkstrand Chat</h1>
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="externalId" className="block text-gray-700 mb-2">
                  Enter your username
                </label>
                <input
                  type="text"
                  id="externalId"
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., john_doe"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Join Chat
              </button>
            </form>
          </div>
        </div>
      ) : (
        <ChatApp externalId={externalId} />
      )}
    </main>
  );
}
