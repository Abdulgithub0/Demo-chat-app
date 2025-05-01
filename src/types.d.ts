import { IMessage, IRoom } from '@sparkstrand/chat-api-client/types';

// Extend the IMessage interface to include additional properties
declare module '@sparkstrand/chat-api-client/types' {
  interface IMessage {
    edited?: boolean;
    tempId?: string;
    analyticId?: string;
  }

  interface IRoom {
    updatedAt?: string | Date;
    createdAt?: string | Date;
    avatar?: {
      filename: string;
      fileUrl: string;
    } | null;
    archived?: boolean;
    setting?: Record<string, any> | null;
    bannedGuestIds?: string[];
    expiresAt?: string | Date | null;
    applicationId?: string;
    userIds?: string[];
    guestIds?: string[];
    tagIds?: string[];
    anonymousIds?: string[];
  }
}
