'use client';

import { useEffect, useRef, useState } from 'react';
import { IMessage } from '@sparkstrand/chat-api-client/types';
import { useFileUpload } from '@sparkstrand/chat-api-client/context';
import { Download, File, Image, Video, Music, X, ZoomIn } from 'lucide-react';

interface MessageListProps {
  messages: IMessage[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; filename: string } | null>(null);
  const { previewFile } = useFileUpload();

  // Helper function to get file URL with options using context previewFile
  const getFileUrl = (file: any, options: { download?: boolean } = {}) => {
    if (file.fileUrl) {
      if (options.download) {
        // Use previewFile to add download parameter
        return previewFile(file.fileUrl, { download: true });
      }
      // For preview/inline viewing, use the fileUrl directly
      return file.fileUrl;
    }
    return file.fileUrl;
  };
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const shouldShowDateSeparator = (currentMessage: IMessage, previousMessage?: IMessage) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();

    return currentDate !== previousDate;
  };

  const shouldShowTimestamp = (currentMessage: IMessage, nextMessage?: IMessage) => {
    if (!nextMessage) return true;

    const currentTime = new Date(currentMessage.createdAt).getTime();
    const nextTime = new Date(nextMessage.createdAt).getTime();
    const timeDiff = nextTime - currentTime;

    // Show timestamp if messages are more than 5 minutes apart or from different senders
    return timeDiff > 5 * 60 * 1000 || currentMessage.sender.id !== nextMessage.sender.id;
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-4 h-4" />;
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="h-full overflow-y-auto space-y-4 scrollbar-hide message-container"
    >
      {messages.map((message, index) => {
        const isOwnMessage = message.sender.id === currentUserId;
        const previousMessage = index > 0 ? messages[index - 1] : undefined;
        const nextMessage = index < messages.length - 1 ? messages[index + 1] : undefined;
        const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
        const showTimestamp = shouldShowTimestamp(message, nextMessage);

        return (
          <div key={message.id}>
            {/* Date Separator */}
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDate(message.createdAt.toString())}
                </div>
              </div>
            )}

            {/* Message */}
            <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'} px-4 py-3`}>
                {/* Sender name for other users' messages */}
                {!isOwnMessage && (
                  <div className="text-xs font-semibold text-gray-700 mb-1">
                    {message.sender.username}
                  </div>
                )}

                {/* Message content */}
                {message.text && (
                  <div className={`text-sm whitespace-pre-wrap break-words ${
                    isOwnMessage ? 'text-white' : 'text-gray-800'
                  }`}>
                    {message.text}
                  </div>
                )}

                {/* File attachments */}
                {message.files && message.files.length > 0 && (
                  <div className={`space-y-2 ${message.text ? 'mt-2' : ''}`}>
                    {message.files.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className={`flex items-center space-x-3 p-2 rounded-lg border ${
                          isOwnMessage
                            ? 'bg-blue-500 border-blue-400'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {/* File preview/icon */}
                        <div className="flex-shrink-0 relative">
                          {file.fileType?.startsWith('image/') ? (
                            <div className="relative group">
                              <img
                                src={file.fileUrl}
                                alt={file.filename}
                                className="w-12 h-12 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedImage({ url: file.fileUrl, filename: file.filename })}
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              {/* Zoom overlay */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                   onClick={() => setSelectedImage({ url: file.fileUrl, filename: file.filename })}>
                                <ZoomIn className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : file.fileType?.startsWith('video/') ? (
                            <div className="relative">
                              <video
                                src={file.fileUrl}
                                className="w-12 h-12 object-cover rounded-lg border"
                                muted
                                preload="metadata"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                                <Video className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : null}
                          <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${
                            file.fileType?.startsWith('image/') || file.fileType?.startsWith('video/') ? 'hidden' : ''
                          } ${
                            isOwnMessage
                              ? 'bg-blue-400 border-blue-300 text-white'
                              : 'bg-gray-100 border-gray-200 text-gray-600'
                          }`}>
                            {getFileIcon(file.fileType)}
                          </div>
                        </div>

                        {/* File info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${
                            isOwnMessage ? 'text-white' : 'text-gray-900'
                          }`}>
                            {file.filename}
                          </p>
                          <p className={`text-xs ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        {/* Download button */}
                        <a
                          href={getFileUrl(file, { download: true })}
                          download={file.filename}
                          className={`flex-shrink-0 p-1 rounded transition-colors ${
                            isOwnMessage
                              ? 'text-white hover:bg-blue-400'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message status and timestamp */}
                <div className={`flex items-center mt-2 text-xs ${
                  isOwnMessage ? 'justify-end text-blue-100' : 'justify-start text-gray-500'
                }`}>
                  <span>{formatTime(message.createdAt.toString())}</span>
                  {isOwnMessage && (
                    <span className="ml-1 opacity-80">
                      {message.status === 'Sent' && '✓'}
                      {message.status === 'Delivered' && '✓✓'}
                      {message.status === 'Read' && <span className="text-green-300">✓✓</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Timestamp separator */}
            {showTimestamp && (
              <div className="flex justify-center mt-2">
                <span className="text-xs text-gray-400">
                  {formatTime(message.createdAt.toString())}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.filename}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-4 right-4 text-white text-center">
              <p className="text-sm font-medium">{selectedImage.filename}</p>
              <a
                href={(() => {
                  const url = new URL(selectedImage.url, window.location.origin);
                  url.searchParams.set('download', 'true');
                  return url.toString();
                })()}
                download={selectedImage.filename}
                className="inline-flex items-center mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
