'use client';

import { IRoom } from '@sparkstrand/chat-api-client/types';

interface RoomListProps {
  rooms: IRoom[];
  currentRoom: IRoom | null;
  onRoomSelect: (roomId: string) => void;
  onCreateRoom: () => void;
}

export default function RoomList({ rooms, currentRoom, onRoomSelect, onCreateRoom }: RoomListProps) {
  const sortedRooms = [...rooms].sort((a, b) => {
    // Sort by last message timestamp, most recent first
    const aLastMessage = a.messages?.[a.messages.length - 1];
    const bLastMessage = b.messages?.[b.messages.length - 1];

    if (!aLastMessage && !bLastMessage) return 0;
    if (!aLastMessage) return 1;
    if (!bLastMessage) return -1;

    return new Date(bLastMessage.createdAt).getTime() - new Date(aLastMessage.createdAt).getTime();
  });

  const handleRoomClick = (roomId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Don't switch if already in this room
    if (currentRoom?.id === roomId) {
      return;
    }

    console.log('[RoomList] Switching to room', roomId);
    onRoomSelect(roomId);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLastMessagePreview = (room: IRoom) => {
    const lastMessage = room.messages?.[room.messages.length - 1];
    if (!lastMessage) return 'No messages yet';

    const preview = lastMessage.text && lastMessage.text.length > 50
      ? lastMessage.text.substring(0, 50) + '...'
      : lastMessage.text || '[File]';

    return `${lastMessage.sender.username}: ${preview}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Create Room Button */}
      <div className="p-4">
        <button
          onClick={onCreateRoom}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          + Create New Room
        </button>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {sortedRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No rooms available</p>
            <p className="text-sm mt-1">Create a room to get started</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sortedRooms.map((room) => {
              const isActive = currentRoom?.id === room.id;
              const lastMessage = room.messages?.[room.messages.length - 1];
              const hasUnreadMessages = false; // You can implement unread message logic here

              return (
                <div
                  key={room.id}
                  onClick={(e) => handleRoomClick(room.id, e)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-colors
                    ${isActive
                      ? 'bg-indigo-100 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium truncate ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {room.name}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(lastMessage.createdAt.toString())}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${isActive ? 'text-indigo-700' : 'text-gray-600'}`}>
                      {getLastMessagePreview(room)}
                    </p>
                    {hasUnreadMessages && (
                      <div className="w-2 h-2 bg-indigo-600 rounded-full ml-2 flex-shrink-0"></div>
                    )}
                  </div>

                  {room.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {room.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
