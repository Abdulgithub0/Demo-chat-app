'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useFileUpload } from '@sparkstrand/chat-api-client/context';
import { Upload, X, File, Image, Video, Music, Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const {
    selectedFiles,
    addFiles,
    removeFile,
    clearFiles,
    config,
    formatFileSize,
    getFileIcon,
    isUploading
  } = useFileUpload();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage || selectedFiles.length > 0) {
      onSendMessage(trimmedMessage, selectedFiles.length > 0 ? selectedFiles.map((f: any) => f.file) : undefined);
      setMessage('');
      clearFiles();
      setIsTyping(false);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // File upload handlers

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setIsTyping(value.length > 0);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-end space-x-3">
        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />

          {/* Character count (optional) */}
          {message.length > 0 && (
            <div className="absolute bottom-1 right-2 text-xs text-gray-400">
              {message.length}
            </div>
          )}
        </div>

        {/* File Upload - Direct Context Usage */}
        <div className="flex flex-col space-y-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={config.acceptedTypes?.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload button */}
          <button
            type="button"
            onClick={openFileDialog}
            disabled={selectedFiles.length >= (config.maxFiles || 5)}
            className={`p-2 rounded-lg transition-colors ${
              selectedFiles.length >= (config.maxFiles || 5)
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
            title="Attach files"
          >
            <Upload className="w-5 h-5" />
          </button>

          {/* Selected files preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((filePreview: any) => (
                <div
                  key={filePreview.id}
                  className="flex items-center space-x-3 p-2 bg-white border border-gray-200 rounded-lg"
                >
                  {/* File icon */}
                  <div className="flex-shrink-0">
                    {filePreview.preview ? (
                      <img
                        src={filePreview.preview}
                        alt={filePreview.file.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        {getFileIcon(filePreview.file.type)}
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {filePreview.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(filePreview.file.size)}
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFile(filePreview.id)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drag and drop area (when files are selected) */}
          {selectedFiles.length > 0 && selectedFiles.length < (config.maxFiles || 5) && (
            <div
              className={`border-2 border-dashed rounded-lg p-3 transition-colors ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className="mx-auto h-6 w-6 text-gray-400" />
                <p className="mt-1 text-xs text-gray-600">
                  Drop more files here or{' '}
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  {selectedFiles.length}/{config.maxFiles || 5} files selected
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() && selectedFiles.length === 0}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors
            ${(message.trim() || selectedFiles.length > 0)
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {/* Typing indicator (optional) */}
      {isTyping && (
        <div className="mt-2 text-xs text-gray-500">
          <span className="flex items-center">
            <span className="animate-pulse">●</span>
            <span className="ml-1">Typing...</span>
          </span>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
}
