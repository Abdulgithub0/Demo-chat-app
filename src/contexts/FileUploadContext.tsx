'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface FilePreview {
  file: File;
  id: string;
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface FileUploadConfig {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  uploadEndpoint?: string;
  apiKey?: string;
}

interface FileUploadContextType {
  // File management
  selectedFiles: FilePreview[];
  addFiles: (files: FileList) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  
  // Upload functionality
  uploadFiles: (roomId?: string) => Promise<string[]>; // Returns file IDs
  uploadProgress: Record<string, number>;
  isUploading: boolean;
  
  // Configuration
  config: FileUploadConfig;
  updateConfig: (newConfig: Partial<FileUploadConfig>) => void;
  
  // Validation
  validateFile: (file: File) => string | null;
  
  // Utilities
  getFileIcon: (fileType: string) => React.ReactNode;
  formatFileSize: (bytes: number) => string;
}

const defaultConfig: FileUploadConfig = {
  maxFiles: 5,
  maxFileSize: 25,
  acceptedTypes: [
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/*'
  ],
  uploadEndpoint: '/api/v1/files/guests'
};

const FileUploadContext = createContext<FileUploadContextType | undefined>(undefined);

interface FileUploadProviderProps {
  children: ReactNode;
  initialConfig?: Partial<FileUploadConfig>;
}

export const FileUploadProvider: React.FC<FileUploadProviderProps> = ({ 
  children, 
  initialConfig = {} 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [config, setConfig] = useState<FileUploadConfig>({
    ...defaultConfig,
    ...initialConfig
  });

  const updateConfig = useCallback((newConfig: Partial<FileUploadConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > (config.maxFileSize || 25) * 1024 * 1024) {
      return `File size must be less than ${config.maxFileSize || 25}MB`;
    }

    // Check file type
    const isAccepted = config.acceptedTypes?.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return 'File type not supported';
    }

    return null;
  }, [config.maxFileSize, config.acceptedTypes]);

  const addFiles = useCallback(async (files: FileList) => {
    const newFiles: FilePreview[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      // Check if we've reached max files
      if (selectedFiles.length + newFiles.length >= (config.maxFiles || 5)) {
        errors.push(`Maximum ${config.maxFiles || 5} files allowed`);
        return;
      }

      // Validate file
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      // Create preview
      const filePreview: FilePreview = {
        file,
        id: `${Date.now()}-${Math.random()}`,
        uploadStatus: 'pending'
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          filePreview.preview = e.target?.result as string;
          setSelectedFiles(prev => 
            prev.map(f => f.id === filePreview.id ? filePreview : f)
          );
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(filePreview);
    });

    if (errors.length > 0) {
      console.error('File upload errors:', errors);
      // You could also emit these errors through a callback or state
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  }, [selectedFiles.length, config.maxFiles, validateFile]);

  const removeFile = useCallback((id: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview && fileToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  }, []);

  const clearFiles = useCallback(() => {
    // Revoke object URLs to prevent memory leaks
    selectedFiles.forEach(file => {
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setSelectedFiles([]);
    setUploadProgress({});
  }, [selectedFiles]);

  const uploadFiles = useCallback(async (roomId?: string): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    const uploadedFileIds: string[] = [];

    try {
      // Update all files to uploading status
      setSelectedFiles(prev => 
        prev.map(file => ({ ...file, uploadStatus: 'uploading' as const }))
      );

      // Create FormData
      const formData = new FormData();
      selectedFiles.forEach(filePreview => {
        formData.append('files', filePreview.file);
        if (roomId) {
          formData.append('roomId', roomId);
        }
      });

      // Get API key from environment or config
      const apiKey = config.apiKey || process.env.NEXT_PUBLIC_SPARKSTRAND_CHAT_API_KEY;
      const uploadEndpoint = config.uploadEndpoint || '/api/v1/files/guests';

      // Upload files
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: apiKey ? { 'X-API-KEY': apiKey } : {},
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      // Extract file IDs
      const fileIds = data.data.map((file: any) => file.id);
      uploadedFileIds.push(...fileIds);

      // Update files to completed status
      setSelectedFiles(prev => 
        prev.map(file => ({ ...file, uploadStatus: 'completed' as const }))
      );

      return fileIds;
    } catch (error) {
      console.error('File upload error:', error);
      
      // Update files to error status
      setSelectedFiles(prev => 
        prev.map(file => ({ 
          ...file, 
          uploadStatus: 'error' as const,
          error: error instanceof Error ? error.message : 'Upload failed'
        }))
      );

      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, config.apiKey, config.uploadEndpoint]);

  const getFileIcon = useCallback((fileType: string): React.ReactNode => {
    // This would return appropriate icons - you can import from lucide-react
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    return '📁';
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const value: FileUploadContextType = {
    selectedFiles,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    uploadProgress,
    isUploading,
    config,
    updateConfig,
    validateFile,
    getFileIcon,
    formatFileSize,
  };

  return (
    <FileUploadContext.Provider value={value}>
      {children}
    </FileUploadContext.Provider>
  );
};

export const useFileUpload = (): FileUploadContextType => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  return context;
};
