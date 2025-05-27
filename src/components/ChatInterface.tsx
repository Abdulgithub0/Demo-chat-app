'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChat, useChatRoom, useChatMessage } from '@sparkstrand/chat-api-client/context';
import { RoomType } from '@sparkstrand/chat-api-client/types';
import RoomList from './RoomList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import CreateRoomModal from './CreateRoomModal';
import { Howl } from 'howler';

interface ChatInterfaceProps {
  onLogout: () => void;
  userId: string;
}

export default function ChatInterface({ onLogout, userId: userIdProp }: ChatInterfaceProps) {
  const { isConnected, login, userId, error, disconnect, client } = useChat();
  const { rooms, currentRoomData, currentRoomMessages, switchRoom, createRoom, emitGetListOfGuestRooms, getRoomDataById } = useChatRoom();
  const { sendMessage } = useChatMessage();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [notificationSound, setNotificationSound] = useState<Howl | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRoomSwitching, setIsRoomSwitching] = useState(false);
  const lastSwitchTimeRef = useRef<number>(0);
  const lastRoomIdRef = useRef<string>('');
  const roomSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Login effect
  useEffect(() => {
    if (!isLoggedIn && !isConnected) {
      login(userIdProp).then(() => {
        setIsLoggedIn(true);
        // Get list of rooms after login
        emitGetListOfGuestRooms();
      }).catch((err) => {
        console.error('Login failed:', err);
      });
    }
  }, [login, userIdProp, isConnected, isLoggedIn, emitGetListOfGuestRooms]);

  useEffect(() => {
    // Initialize notification sound - using a simple beep for now
    try {
      const sound = new Howl({
        src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'],
        volume: 0.3,
        preload: false,
      });
      setNotificationSound(sound);

      return () => {
        sound.unload();
      };
    } catch (error) {
      console.warn('Could not initialize notification sound:', error);
    }
  }, []);

  useEffect(() => {
    // Play notification sound for new messages (except own messages)
    if (notificationSound && currentRoomMessages.length > 0) {
      const lastMessage = currentRoomMessages[currentRoomMessages.length - 1];
      if (lastMessage && lastMessage.sender.id !== userId) {
        notificationSound.play();
      }
    }
  }, [currentRoomMessages, notificationSound, userId]);

  // Monitor current room changes
  useEffect(() => {
    console.log('[ChatInterface] Current room data changed:', currentRoomData?.id, currentRoomData?.name);
    console.log('[ChatInterface] Current room messages count:', currentRoomMessages.length);

    // If we have room data, we're no longer switching
    if (currentRoomData) {
      setIsRoomSwitching(false);
      // Clear any pending timeout
      if (roomSwitchTimeoutRef.current) {
        clearTimeout(roomSwitchTimeoutRef.current);
        roomSwitchTimeoutRef.current = null;
      }
    }
  }, [currentRoomData, currentRoomMessages]);

  // Add socket event debugging
  useEffect(() => {
    if (!client) return;

    const handleRoomData = (room: any) => {
      console.log('[ChatInterface] ROOM_DATA event received:', room?.id, room?.name);
    };

    const handleRoomSwitched = (data: any) => {
      console.log('[ChatInterface] ROOM_SWITCHED event received:', data);
    };

    // Listen to the events for debugging
    client.on('room_data', handleRoomData);
    client.on('room_switched', handleRoomSwitched);

    return () => {
      client.removeListener('room_data', handleRoomData);
      client.removeListener('room_switched', handleRoomSwitched);
    };
  }, [client]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (roomSwitchTimeoutRef.current) {
        clearTimeout(roomSwitchTimeoutRef.current);
      }
    };
  }, []);

  // Debounced room switch to prevent multiple calls
  const handleRoomSwitch = useCallback((roomId: string) => {
    const now = Date.now();
    const timeSinceLastSwitch = now - lastSwitchTimeRef.current;

    // Prevent switching to the same room or switching too quickly (within 500ms)
    if (lastRoomIdRef.current === roomId || timeSinceLastSwitch < 500) {
      console.log('[ChatInterface] Ignoring duplicate room switch to', roomId);
      return;
    }

    console.log('[ChatInterface] Switching to room', roomId);
    console.log('[ChatInterface] Current room before switch:', currentRoomData?.id);
    setIsRoomSwitching(true);
    lastSwitchTimeRef.current = now;
    lastRoomIdRef.current = roomId;

    // Clear any existing timeout
    if (roomSwitchTimeoutRef.current) {
      clearTimeout(roomSwitchTimeoutRef.current);
    }

    // Set a timeout to manually fetch room data if switchRoom doesn't work
    roomSwitchTimeoutRef.current = setTimeout(() => {
      console.log('[ChatInterface] Room switch timeout - manually fetching room data for:', roomId);
      getRoomDataById(roomId);
    }, 3000); // 3 second timeout

    switchRoom(roomId);
  }, [switchRoom, currentRoomData]);

  const handleLogout = async () => {
    disconnect();
    onLogout();
  };

  const handleCreateRoom = async (roomName: string, description: string) => {
    try {
      createRoom({
        name: roomName,
        description,
        type: RoomType.GROUP,
      });
      setShowCreateRoom(false);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (currentRoomData && (content.trim() || files?.length)) {
      try {
        console.log('[ChatInterface] Sending message:', content, 'Files:', files?.length || 0);
        sendMessage({
          to: currentRoomData.id,
          text: content || undefined,
          senderId: userId || undefined,
          files: files,
        });
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  if (!isConnected || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {error ? `Error: ${error.message}` : 'Connecting to chat...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-100 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Spark Strand Chat</h1>
              <p className="text-sm text-gray-600">Welcome, {userId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-hidden">
          <RoomList
            rooms={rooms}
            currentRoom={currentRoomData}
            onRoomSelect={handleRoomSwitch}
            onCreateRoom={() => setShowCreateRoom(true)}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {isRoomSwitching ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading room...</p>
            </div>
          </div>
        ) : currentRoomData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">{currentRoomData.name}</h2>
              {currentRoomData.description && (
                <p className="text-sm text-gray-600">{currentRoomData.description}</p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={currentRoomMessages}
                currentUserId={userId || ''}
              />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-white">
              <MessageInput onSendMessage={handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Spark Strand Chat
              </h3>
              <p className="text-gray-600 mb-4">
                Select a room from the sidebar to start chatting
              </p>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Create New Room
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          onCreateRoom={handleCreateRoom}
          onClose={() => setShowCreateRoom(false)}
        />
      )}
    </div>
  );
}
