'use client';

import React from 'react';
import { UserStatus } from '@sparkstrand/chat-api-client/types';

interface ChatHeaderProps {
  currentRoom: string | null;
  userStatus: UserStatus;
  onStatusChange: (status: UserStatus) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentRoom,
  userStatus,
  onStatusChange
}) => {
  return (
    <div className="chat-header">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">Sparkstrand Chat</h1>
        {currentRoom && (
          <span className="ml-4 text-gray-300">
            Room: {currentRoom}
          </span>
        )}
      </div>

      <div className="flex items-center">
        <div className="relative mr-4">
          <select
            value={userStatus}
            onChange={(e) => onStatusChange(e.target.value as UserStatus)}
            className="bg-gray-700 text-white rounded px-2 py-1 text-sm appearance-none pr-8"
          >
            <option value={UserStatus.ONLINE}>Online</option>
            <option value={UserStatus.AWAY}>Away</option>
            <option value={UserStatus.OFFLINE}>Offline</option>
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>
          </div>
        </div>

        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            userStatus === UserStatus.ONLINE ? 'bg-green-500' :
            userStatus === UserStatus.AWAY ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm">
            {userStatus === UserStatus.ONLINE ? 'Online' :
             userStatus === UserStatus.AWAY ? 'Away' : 'Offline'}
            {' '}({userStatus})
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
