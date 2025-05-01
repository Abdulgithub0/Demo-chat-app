'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSparkStrandChat } from '@sparkstrand/chat-api-client/hooks';
import { IMessage, UserStatus, SocketEvent, RoomType } from '@sparkstrand/chat-api-client/types';

import ChatHeader from './ChatHeader';
import RoomList from './RoomList';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Modal from './Modal';
import CreateRoomForm from './CreateRoomForm';
import JoinRoomForm from './JoinRoomForm';
import ConnectionStatus from './ConnectionStatus';
import NotificationSound from './NotificationSound';

interface ChatAppProps {
  externalId: string;
}

const ChatApp: React.FC<ChatAppProps> = ({ externalId }) => {
  const [clientToken, setClientToken] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatServerUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'https://chat-application-h0xp.onrender.com';
  const { socket, state: originalState } = useSparkStrandChat(chatServerUrl, clientToken, { debug: true, autoConnect: false });

  // Create a local state that we can update immediately
  const [localState, setLocalState] = useState({
    currentRoomId: null as string | null,
    user: null as any
  });

  // Modal states
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);

  // Update local state when original state changes
  useEffect(() => {
    setLocalState({
      currentRoomId: originalState.currentRoomId,
      user: originalState.user ? { ...originalState.user } : null
    });
  }, [originalState.currentRoomId, originalState.user]);

  // Handle initial room selection when rooms are loaded
  useEffect(() => {
    if (originalState.rooms && originalState.rooms.length > 0 && !localState.currentRoomId) {
      // Find a room with messages if possible
      const roomWithMessages = originalState.rooms.find(room => room.messages && room.messages.length > 0);

      // Otherwise use the first room
      const roomToSelect = roomWithMessages || originalState.rooms[0];

      if (roomToSelect) {
        console.log(`Auto-selecting room: ${roomToSelect.name} (${roomToSelect.id})`);
        handleRoomSelect(roomToSelect.id);
      }
    }
  }, [originalState.rooms, localState.currentRoomId]);

  // Fetch client token on component mount
  useEffect(() => {
    const initiateAuth = async () => {
      try {
        const response = await axios.post('/api/auth/initiate', { externalId });
        setClientToken(response.data.clientToken);
      } catch (error) {
        console.error('Authentication failed:', error);
      } finally {
        setIsAuthenticating(false);
      }
    };

    if (!clientToken) {
      initiateAuth();
    }
  }, [externalId, clientToken]);

  // Add a custom event listener for new messages
  const [localMessages, setLocalMessages] = useState<IMessage[]>([]);
  const [playNotification, setPlayNotification] = useState(false);
  const [lastMessageRoomId, setLastMessageRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      console.log('New message received:', data);
      // The data structure might be different based on the server response
      const messageData = data.data || data;

      if (messageData && messageData.id) {
        // Check if the message is from another user
        const isFromCurrentUser = messageData.from?.id === originalState.user?.id;

        // Add the message to local messages
        setLocalMessages(prev => [...prev, messageData]);

        // Store the room ID of the message for room sorting
        const roomId = messageData.roomId || messageData.to;
        if (roomId) {
          setLastMessageRoomId(roomId);
        }

        // Play notification sound only for messages from others
        if (!isFromCurrentUser) {
          setPlayNotification(true);
        }
      }
    };

    socket.on(SocketEvent.NEW_MESSAGE, handleNewMessage);

    return () => {
      socket.off(SocketEvent.NEW_MESSAGE, handleNewMessage);
    };
  }, [socket, originalState.user?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [originalState.messages, localMessages]);

  const handleSendMessage = (text: string) => {
    if (localState.currentRoomId) {
      // Generate a unique ID for this message
      const tempId = `temp-${Date.now()}`;

      // Create a message object to send
      const messageToSend = {
        roomId: localState.currentRoomId,
        text,
        from: { id: originalState.user?.id || '', type: 'guest' },
        tempId // Add a tempId to identify this message later
      };

      // Send the message to the server
      socket.sendMessage(messageToSend);

      // Create a temporary local message for immediate display
      const tempMessage: IMessage = {
        id: tempId, // Use the same tempId as the key
        text,
        from: { id: originalState.user?.id || '', type: 'guest' },
        roomId: localState.currentRoomId,
        to: localState.currentRoomId,
        createdAt: new Date(),
        read: false,
        isPinned: false,
        isAnswered: false,
        isEncrypted: false,
        tempId // Store the tempId in the message object
      };

      // Update the lastMessageRoomId for room sorting
      setLastMessageRoomId(localState.currentRoomId);

      // Add to local messages for immediate display
      setLocalMessages(prev => [...prev, tempMessage]);
    }
  };

  const handleRoomSelect = (roomId: string) => {
    // Only switch rooms if the selected room is different from the current room
    if (roomId !== localState.currentRoomId) {
      console.log(`Switching to room: ${roomId}`);

      // Use the switchRoom method
      socket.switchRoom(roomId);

      // Update local state immediately
      setLocalState(prev => ({
        ...prev,
        currentRoomId: roomId,
        user: prev.user ? { ...prev.user, currentRoomId: roomId } : null
      }));

      console.log("Switched to room - local state updated:", roomId);
    }
  };

  const handleTyping = () => {
    if (localState.currentRoomId) {
      socket.sendTypingIndicator(localState.currentRoomId);
    }
  };

  const handleStatusChange = (status: UserStatus) => {
    // Only update the current user's status
    if (originalState.user && originalState.user.id) {
      console.log(`Setting status for user ${originalState.user.id} to ${status}`);

      // Debug: Log the current status before changing
      console.log('Current user status:', originalState.user.status);
      console.log('Status enum values:', Object.values(UserStatus));

      // Send the status change to the server
      socket.setUserStatus(status);

      // Debug: Update local state for immediate feedback
      setLocalState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, status } : null
      }));
    }
  };

  // Room creation and joining handlers
  const handleCreateRoom = (name: string, type: RoomType, membersId: string[]) => {
    if (!originalState.user?.id) {
      console.error('Cannot create room: User ID is missing');
      return;
    }

    const applicationId = originalState.user.id;
    console.log(`Creating room with name: ${name}, type: ${type}, members: ${membersId.join(', ')}, applicationId: ${applicationId}`);

    // Create a unique room object to avoid duplicates
    const roomData = {
      name,
      type,
      membersId,
      applicationId
    };

    // Send the create room request to the server
    socket.createRoom(roomData);

    // Close the modal
    setIsCreateRoomModalOpen(false);
  };

  const handleJoinRoom = (roomId: string) => {
    socket.joinRoom(roomId);
    setIsJoinRoomModalOpen(false);

    // Update local state immediately for better UX
    setLocalState(prev => ({
      ...prev,
      currentRoomId: roomId,
      user: prev.user ? { ...prev.user, currentRoomId: roomId } : null
    }));
  };

  // Get messages for current room
  // First check if there are messages in the current room object
  const currentRoom = originalState.rooms?.find((room: any) => room.id === localState.currentRoomId);
  const roomMessages = currentRoom?.messages || [];

  // Then combine with any messages from the state that match the current room
  // For new messages, the roomId might be in the 'to' field instead of 'roomId'
  const stateMessages = originalState.messages?.filter(
    (message: IMessage) => message.roomId === localState.currentRoomId || message.to === localState.currentRoomId
  ) || [];

  // Filter local messages for the current room
  const localRoomMessages = localMessages.filter(
    (message: IMessage) => message.roomId === localState.currentRoomId || message.to === localState.currentRoomId
  );

  // Combine all sources of messages and sort by creation date
  const currentRoomMessages = [...roomMessages, ...stateMessages, ...localRoomMessages]
    .filter((message: any) => message.id) // Filter out any undefined messages
    // Remove duplicates based on message ID or tempId
    .filter((message: any, index: number, self: any[]) => {
      // For temporary messages (from the current user), check if there's a real message with the same text and sender
      if (message.id.toString().startsWith('temp-')) {
        // Check if there's a real message (from server) with the same text and sender
        const realMessage = self.find(m =>
          !m.id.toString().startsWith('temp-') &&
          m.text === message.text &&
          m.from?.id === message.from?.id &&
          Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 60000 // Within 1 minute
        );
        return !realMessage; // Keep temp message only if no matching real message exists
      }

      // For real messages, check if this is the first occurrence
      return index === self.findIndex((m: any) => m.id === message.id);
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });

  // Debug log to see what messages are being loaded
  useEffect(() => {
    if (localState.currentRoomId && currentRoomMessages.length > 0) {
      console.log(`Room ${localState.currentRoomId} has ${currentRoomMessages.length} messages:`,
        currentRoomMessages.map((m: any) => ({ id: m.id, text: m.text, createdAt: m.createdAt }))
      );
    }
  }, [localState.currentRoomId, currentRoomMessages.length]);

  // Get typing users for current room
  const typingUsers = originalState.typingUsers?.[localState.currentRoomId || ''] || [];

  // Get current room name (we already have the currentRoom object from above)
  const currentRoomName = currentRoom?.name || null;

  if (isAuthenticating || !clientToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  // Function to manually reconnect
  const handleReconnect = async () => {
    try {
      console.log('Manually attempting to reconnect...');
      await socket.reconnect();
    } catch (error) {
      console.error('Manual reconnection failed:', error);
    }
  };

  // Show loading screen only during initial authentication
  if (isAuthenticating || !clientToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  // Show full error screen only if we have no user data and can't recover
  if (!originalState.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            {originalState.error?.message || "Couldn't connect to the chat server"}
          </p>
          <button
            onClick={handleReconnect}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ChatHeader
        currentRoom={currentRoomName}
        userStatus={localState.user?.status || originalState.user.status || UserStatus.ONLINE}
        onStatusChange={handleStatusChange}
      />

      <div className="chat-main">
        <div className="chat-sidebar">
          <RoomList
            rooms={(originalState.rooms || [])
              // Remove duplicate rooms by filtering based on ID
              .filter((room: any, index: number, self: any[]) =>
                index === self.findIndex((r: any) => r.id === room.id)
              )
              // Sort rooms by latest message (room with last message at top)
              .sort((a: any, b: any) => {
                // If this is the room with the last message, put it at the top
                if (lastMessageRoomId === a.id) return -1;
                if (lastMessageRoomId === b.id) return 1;

                // Otherwise sort by updatedAt date
                const dateA = new Date(a.updatedAt).getTime();
                const dateB = new Date(b.updatedAt).getTime();
                return dateB - dateA; // Descending order (newest first)
              })
            }
            currentRoomId={localState.currentRoomId}
            onRoomSelect={handleRoomSelect}
            onCreateRoom={() => setIsCreateRoomModalOpen(true)}
            onJoinRoom={() => setIsJoinRoomModalOpen(true)}
          />
        </div>

        <div className="chat-messages-container">
          <div className="chat-messages">
            {currentRoomMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                {localState.currentRoomId
                  ? "No messages yet. Start the conversation!"
                  : "Select a room to start chatting"}
              </div>
            ) : (
              currentRoomMessages.map((message: IMessage) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  currentUserId={originalState.user?.id || ''}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="typing-indicator">
            {typingUsers.length > 0 && (
              <span>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            )}
          </div>

          <ChatInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            disabled={!localState.currentRoomId}
          />
        </div>
      </div>

      {/* Create Room Modal */}
      <Modal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setIsCreateRoomModalOpen(false)}
        title="Create New Room"
      >
        <CreateRoomForm
          onSubmit={handleCreateRoom}
          onCancel={() => setIsCreateRoomModalOpen(false)}
        />
      </Modal>

      {/* Join Room Modal */}
      <Modal
        isOpen={isJoinRoomModalOpen}
        onClose={() => setIsJoinRoomModalOpen(false)}
        title="Join Room"
      >
        <JoinRoomForm
          onSubmit={handleJoinRoom}
          onCancel={() => setIsJoinRoomModalOpen(false)}
        />
      </Modal>

      {/* Connection status indicator */}
      {originalState.connectionStatus && originalState.connectionStatus !== 'connected' && (
        <ConnectionStatus
          status={originalState.connectionStatus}
          error={originalState.error?.message}
          onRetry={handleReconnect}
        />
      )}

      {/* Notification sound */}
      <NotificationSound
        play={playNotification}
        onPlayed={() => setPlayNotification(false)}
      />
    </div>
  );
};

export default ChatApp;
