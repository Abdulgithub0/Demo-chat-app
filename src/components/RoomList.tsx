'use client';

import React from 'react';
import { IRoom } from '@sparkstrand/chat-api-client/types';

interface RoomListProps {
  rooms: IRoom[] | undefined;
  currentRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  onCreateRoom?: () => void;
  onJoinRoom?: () => void;
}

const RoomList: React.FC<RoomListProps> = ({
  rooms = [],
  currentRoomId,
  onRoomSelect,
  onCreateRoom,
  onJoinRoom
}) => {
  return (
    <div className="chat-rooms">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Rooms</h2>
        <div className="flex space-x-2">
          {onCreateRoom && (
            <button
              onClick={onCreateRoom}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create
            </button>
          )}
          {onJoinRoom && (
            <button
              onClick={onJoinRoom}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              Join
            </button>
          )}
        </div>
      </div>

      {!rooms || rooms.length === 0 ? (
        <p className="text-gray-500">No rooms available</p>
      ) : (
        rooms.map((room) => (
          <div
            key={room.id}
            className={`chat-room-item ${currentRoomId === room.id ? 'active' : ''}`}
            onClick={() => onRoomSelect(room.id)}
          >
            <div className="flex items-center w-full">
              <div className={`w-2 h-2 rounded-full ${(room.onlineMembersCount || 0) > 0 ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate">{room.name}</span>
                  <span className="text-xs text-gray-500">
                    {room.updatedAt ? new Date(room.updatedAt).toLocaleDateString() : 'No date'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {room.type === 'dm' ? 'Direct Message' : 'Group'}
                  </span>
                  <span>
                    {room.onlineMembersCount || 0}/{room.membersCount || 0} online
                  </span>
                </div>
                {room.messages && room.messages.length > 0 && (
                  <div className="text-xs text-gray-600 truncate mt-1">
                    {room.messages[0].text}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RoomList;
