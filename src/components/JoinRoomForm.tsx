'use client';

import React, { useState } from 'react';

interface JoinRoomFormProps {
  onSubmit: (roomId: string) => void;
  onCancel: () => void;
}

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ onSubmit, onCancel }) => {
  const [roomId, setRoomId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(roomId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
          Room ID
        </label>
        <input
          type="text"
          id="roomId"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm text-white bg-green-500 rounded-md hover:bg-green-600"
        >
          Join Room
        </button>
      </div>
    </form>
  );
};

export default JoinRoomForm;
