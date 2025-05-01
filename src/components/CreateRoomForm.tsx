'use client';

import React, { useState } from 'react';
import { RoomType } from '@sparkstrand/chat-api-client/types';

interface CreateRoomFormProps {
  onSubmit: (name: string, type: RoomType, membersId: string[]) => void;
  onCancel: () => void;
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<RoomType>(RoomType.GROUP);
  const [membersInput, setMembersInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse members input into an array of IDs
    const membersId = membersInput
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    onSubmit(name, type, membersId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Room Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Room Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as RoomType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value={RoomType.GROUP}>Group</option>
          <option value={RoomType.DM}>Direct Message</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="members" className="block text-sm font-medium text-gray-700 mb-1">
          Members (comma-separated IDs)
        </label>
        <input
          type="text"
          id="members"
          value={membersInput}
          onChange={(e) => setMembersInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="For DM chats, enter exactly one ID"
        />
        {type === RoomType.DM && (
          <p className="text-xs text-gray-500 mt-1">
            For direct messages, please enter exactly one recipient ID
          </p>
        )}
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
          className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Create Room
        </button>
      </div>
    </form>
  );
};

export default CreateRoomForm;
