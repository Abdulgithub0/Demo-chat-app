'use client';

import { useEffect, useState } from 'react';
import { ChatProvider } from '@sparkstrand/chat-api-client/context';
import { SocketClientOptions } from '@sparkstrand/chat-api-client/types';
import ChatInterface from './ChatInterface';

interface ChatAppProps {
  userId: string;
  onLogout: () => void;
}

export default function ChatApp({ userId, onLogout }: ChatAppProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize the chat application
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing chat application...</p>
        </div>
      </div>
    );
  }

  const chatOptions: SocketClientOptions = {
    url: process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:3001',
    apiKey: process.env.NEXT_PUBLIC_CHAT_API_KEY || 'demo-api-key',
    id: userId, // Use userId directly
    autoConnect: false,
    debug: process.env.NODE_ENV === 'development',
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 30000,
    timeout: 30000,
  };

  return (
    <ChatProvider options={chatOptions}>
      <ChatInterface onLogout={onLogout} userId={userId} />
    </ChatProvider>
  );
}
