'use client';

import { useState } from 'react';
import { ChatProvider, useFileUpload, useChatMessage, useChat } from '@sparkstrand/chat-api-client/context';
import { Upload, X, Send, File, Image, Video, Music } from 'lucide-react';

function FileUploadTest() {
  const [message, setMessage] = useState('');
  const { userId, isConnected } = useChat();
  const { sendMessage } = useChatMessage();
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const handleSendMessage = async () => {
    if ((message.trim() || selectedFiles.length > 0) && userId) {
      try {
        await sendMessage({
          text: message.trim(),
          to: 'test-room-id', // Test room
          senderId: userId,
          files: selectedFiles.length > 0 ? selectedFiles.map(f => f.file) : undefined
        });
        
        setMessage('');
        clearFiles();
        alert('Message sent successfully!');
      } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send message: ' + (error as Error).message);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">File Upload Test</h1>
        
        {/* Connection Status */}
        <div className="mb-4 p-3 rounded-lg bg-gray-50">
          <p className="text-sm">
            <strong>Connection Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}
          </p>
          <p className="text-sm">
            <strong>User ID:</strong> {userId || 'Not set'}
          </p>
        </div>

        {/* Configuration Display */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Current Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium text-blue-800">Max Files:</span>
              <span className="text-blue-700 ml-1">{config.maxFiles}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Max Size:</span>
              <span className="text-blue-700 ml-1">{config.maxFileSize}MB</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Upload Status:</span>
              <span className="text-blue-700 ml-1">{isUploading ? 'Uploading...' : 'Ready'}</span>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files ({selectedFiles.length}/{config.maxFiles})
            </label>
            <input
              type="file"
              multiple
              accept={config.acceptedTypes?.join(',')}
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Selected Files Display */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">Selected Files</h4>
                <button
                  onClick={clearFiles}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((filePreview: any) => (
                  <div
                    key={filePreview.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    {/* File preview/icon */}
                    <div className="flex-shrink-0">
                      {filePreview.preview ? (
                        <img
                          src={filePreview.preview}
                          alt={filePreview.file.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-white rounded border flex items-center justify-center">
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
                        {formatFileSize(filePreview.file.size)} • {filePreview.file.type}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFile(filePreview.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && selectedFiles.length === 0) || !userId || isUploading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>
                {isUploading 
                  ? 'Uploading...' 
                  : `Send ${selectedFiles.length > 0 ? `with ${selectedFiles.length} file(s)` : 'Message'}`
                }
              </span>
            </button>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Test Instructions</h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Select one or more files using the file input above</li>
            <li>Optionally add a text message</li>
            <li>Click "Send" to test the file upload functionality</li>
            <li>Check the browser console for upload progress and results</li>
            <li>Files will be uploaded to the test room "test-room-id"</li>
          </ol>
        </div>

        {/* Context State Debug */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Debug Information</h4>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify({
              selectedFilesCount: selectedFiles.length,
              isUploading,
              configMaxFiles: config.maxFiles,
              configMaxSize: config.maxFileSize,
              configAcceptedTypes: config.acceptedTypes?.slice(0, 3), // Show first 3 types
              isConnected,
              userId
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function TestFileUploadPage() {
  return (
    <ChatProvider
      options={{
        url: process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://chat-application-pr-47.onrender.com',
        apiKey: process.env.NEXT_PUBLIC_CHAT_API_KEY || '',
        id: 'test-user-' + Date.now(),
        debug: true,
      }}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <FileUploadTest />
      </div>
    </ChatProvider>
  );
}
