'use client';

import React, { useState } from 'react';
import { useFileUpload } from '@sparkstrand/chat-api-client/context';
import {
  Upload,
  X,
  Download,
  Eye,
  ExternalLink,
  Settings,
  File,
  Image,
  Video,
  Music,
  FileText,
  Archive
} from 'lucide-react';

/**
 * Comprehensive demo component showcasing all file upload features from chat-api-client context
 */
export default function FileUploadDemo() {
  const [showConfig, setShowConfig] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const {
    selectedFiles,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    uploadProgress,
    isUploading,
    validateFile,
    getFileIcon,
    formatFileSize,
    previewFile,
    config,
    updateConfig
  } = useFileUpload();

  // Enhanced file icon mapping
  const getEnhancedFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-5 h-5 text-yellow-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const handleUploadFiles = async () => {
    try {
      const fileIds = await uploadFiles('demo-room-id');
      console.log('Uploaded file IDs:', fileIds);
      alert(`Successfully uploaded ${fileIds.length} files!`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error as Error).message);
    }
  };

  const handleConfigChange = (newConfig: any) => {
    updateConfig(newConfig);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">File Upload Context Demo</h2>

      {/* Configuration Panel */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Files</label>
            <input
              type="number"
              value={config.maxFiles || 5}
              onChange={(e) => handleConfigChange({ maxFiles: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              min="1"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Size (MB)</label>
            <input
              type="number"
              value={config.maxFileSize || 25}
              onChange={(e) => handleConfigChange({ maxFileSize: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              min="1"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* File Selection Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">File Selection Methods</h3>

        {/* Method 1: File Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <h4 className="font-medium mb-2">Method 1: File Input</h4>
          <input
            type="file"
            multiple
            accept={config.acceptedTypes?.join(',')}
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {/* Method 2: Button Trigger */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <h4 className="font-medium mb-2">Method 2: Button Trigger</h4>
          <input
            type="file"
            multiple
            accept={config.acceptedTypes?.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id="hidden-file-input"
          />
          <button
            onClick={() => document.getElementById('hidden-file-input')?.click()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </button>
        </div>

        {/* Method 3: Drag & Drop */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) {
              addFiles(e.dataTransfer.files);
            }
          }}
        >
          <h4 className="font-medium mb-2">Method 3: Drag & Drop</h4>
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop files here
          </p>
        </div>
      </div>

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Selected Files ({selectedFiles.length})</h3>
            <div className="space-x-2">
              <button
                onClick={handleUploadFiles}
                disabled={isUploading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </button>
              <button
                onClick={clearFiles}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            {selectedFiles.map((filePreview: any) => (
              <div
                key={filePreview.id}
                className="flex items-center space-x-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {/* File preview/icon */}
                <div className="flex-shrink-0">
                  {filePreview.preview ? (
                    <img
                      src={filePreview.preview}
                      alt={filePreview.file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(filePreview.file.type)}
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {filePreview.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(filePreview.file.size)} • {filePreview.file.type}
                  </p>
                  <p className="text-xs text-gray-400">
                    Status: {filePreview.uploadStatus || 'pending'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {filePreview.preview && (
                    <a
                      href={filePreview.preview}
                      download={filePreview.file.name}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => removeFile(filePreview.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context State Display */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Context State</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Selected Files:</strong> {selectedFiles.length}</p>
          <p><strong>Is Uploading:</strong> {isUploading ? 'Yes' : 'No'}</p>
          <p><strong>Max Files:</strong> {config.maxFiles}</p>
          <p><strong>Max Size:</strong> {config.maxFileSize}MB</p>
          <p><strong>Accepted Types:</strong> {config.acceptedTypes?.join(', ')}</p>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Usage Examples</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Add Files:</strong> <code>addFiles(fileList)</code></p>
          <p><strong>Remove File:</strong> <code>removeFile(fileId)</code></p>
          <p><strong>Clear All:</strong> <code>clearFiles()</code></p>
          <p><strong>Upload Files:</strong> <code>await uploadFiles(roomId)</code></p>
          <p><strong>Validate File:</strong> <code>validateFile(file)</code></p>
          <p><strong>Update Config:</strong> <code>updateConfig({'{maxFiles: 10}'})</code></p>
        </div>
      </div>
    </div>
  );
}
