'use client';

import { ChatProvider } from '@sparkstrand/chat-api-client/context';
import FileUploadDemo from '../../components/FileUploadDemo';

export default function FileUploadDemoPage() {
  return (
    <ChatProvider
      options={{
        url: process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://chat-application-pr-47.onrender.com',
        apiKey: process.env.NEXT_PUBLIC_CHAT_API_KEY || '',
        id: 'demo-user',
        debug: true,
      }}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              File Upload Context Demo
            </h1>
            <p className="text-gray-600">
              Comprehensive demonstration of file upload functionality from @sparkstrand/chat-api-client
            </p>
          </div>
          
          <FileUploadDemo />
          
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Features Demonstrated</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">File Selection</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• File input selection</li>
                  <li>• Drag & drop support</li>
                  <li>• Multiple file selection</li>
                  <li>• File type validation</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">File Management</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Add/remove files</li>
                  <li>• Clear all files</li>
                  <li>• File size formatting</li>
                  <li>• Upload progress tracking</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Configuration</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Dynamic config updates</li>
                  <li>• Preset configurations</li>
                  <li>• File type restrictions</li>
                  <li>• Size and count limits</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">File Preview</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Image thumbnails</li>
                  <li>• File type icons</li>
                  <li>• Preview functionality</li>
                  <li>• File information display</li>
                </ul>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">Upload Control</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Manual upload trigger</li>
                  <li>• Upload status tracking</li>
                  <li>• Error handling</li>
                  <li>• Progress indicators</li>
                </ul>
              </div>
              
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-2">Context Integration</h3>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Real-time state updates</li>
                  <li>• Context-based management</li>
                  <li>• Reusable across components</li>
                  <li>• TypeScript support</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Usage Examples</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Basic Hook Usage</h3>
                <pre className="text-sm text-gray-700 overflow-x-auto">
{`import { useFileUpload } from '@sparkstrand/chat-api-client/context';

const MyComponent = () => {
  const { selectedFiles, addFiles, removeFile, clearFiles } = useFileUpload();
  
  return (
    <div>
      <input 
        type="file" 
        multiple 
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />
      <p>{selectedFiles.length} files selected</p>
    </div>
  );
};`}
                </pre>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Configuration Management</h3>
                <pre className="text-sm text-gray-700 overflow-x-auto">
{`const { config, updateConfig } = useFileUpload();

// Set image-only mode
updateConfig({
  maxFiles: 3,
  maxFileSize: 10,
  acceptedTypes: ['image/*']
});

// Set document mode
updateConfig({
  maxFiles: 1,
  maxFileSize: 50,
  acceptedTypes: ['application/pdf']
});`}
                </pre>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">File Upload with Messages</h3>
                <pre className="text-sm text-gray-700 overflow-x-auto">
{`const { selectedFiles, clearFiles } = useFileUpload();
const { sendMessage } = useChatMessage();

const handleSend = () => {
  sendMessage({
    text: "Check out these files!",
    to: roomId,
    files: selectedFiles.map(f => f.file) // Auto-upload
  });
  clearFiles(); // Clear after sending
};`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
