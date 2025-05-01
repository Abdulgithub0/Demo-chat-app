'use client';

import React from 'react';
import { IMessage } from '@sparkstrand/chat-api-client/types';

interface ChatMessageProps {
  message: IMessage;
  currentUserId: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserId }) => {
  const isSentByCurrentUser = message.from?.id === currentUserId;

  return (
    <div className={`chat-message ${isSentByCurrentUser ? 'sent' : 'received'}`}>
      <div className={`chat-message-bubble ${message.isPinned ? 'border-l-4 border-yellow-400 pl-2' : ''}`}>
        {!isSentByCurrentUser && (
          <div className="text-xs font-semibold mb-1">
            {message.from?.id === currentUserId ? 'You' : `User ${message.from?.id.substring(0, 6)}...`}
          </div>
        )}
        <div>{message.text}</div>
        {message.edited && <span className="text-xs text-gray-500 ml-2">(edited)</span>}
      </div>
      <div className={`text-xs text-gray-500 mt-1 flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div className="flex items-center">
          {message.createdAt && (
            <span className="mr-2">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {message.isPinned && <span className="mr-1" title="Pinned">📌</span>}
          {message.isAnswered && <span className="mr-1" title="Answered">✅</span>}
          {isSentByCurrentUser && (message.read ? <span title="Read">✓✓</span> : <span title="Sent">✓</span>)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
