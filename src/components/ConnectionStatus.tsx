'use client';

import React from 'react';

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
  error?: string | null;
  onRetry?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  status, 
  error, 
  onRetry 
}) => {
  if (status === 'connected') {
    return null; // Don't show anything when connected
  }

  let statusText = '';
  let statusClass = '';
  let icon = '';

  switch (status) {
    case 'connecting':
      statusText = 'Connecting to chat server...';
      statusClass = 'bg-blue-100 text-blue-800';
      icon = '🔄';
      break;
    case 'reconnecting':
      statusText = 'Reconnecting to chat server...';
      statusClass = 'bg-yellow-100 text-yellow-800';
      icon = '🔄';
      break;
    case 'disconnected':
      statusText = error || 'Disconnected from chat server';
      statusClass = 'bg-red-100 text-red-800';
      icon = '⚠️';
      break;
  }

  return (
    <div className={`fixed bottom-4 right-4 ${statusClass} px-4 py-2 rounded-lg shadow-md flex items-center z-50`}>
      <span className="mr-2 text-lg">{icon}</span>
      <span>{statusText}</span>
      {status === 'disconnected' && onRetry && (
        <button 
          onClick={onRetry}
          className="ml-3 px-2 py-1 bg-white rounded text-sm hover:bg-gray-100"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
