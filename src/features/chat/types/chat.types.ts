export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VOICE = 'VOICE',
  SYSTEM = 'SYSTEM',
}

export enum SenderType {
  USER = 'USER',
  STYLIST = 'STYLIST',
  SYSTEM = 'SYSTEM',
}

export enum ChatRoomStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface ChatRoom {
  id: string;
  bookingId: string;
  bookingNumber: string;
  userId: string;
  userName: string;
  userProfilePic?: string;
  stylistId: string;
  stylistName: string;
  stylistProfilePic?: string;
  status: ChatRoomStatus;
  lastMessage?: string;
  lastMessageAt?: string;
  updatedAt: string;
  user?: {
    name: string;
    profilePicture?: string;
  };
  stylist?: {
    name: string;
    profilePicture?: string;
  };
  booking?: {
    bookingNumber: string;
    status: string;
    completedAt?: string;
    cancelledAt?: string;
  };
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderType: SenderType;
  messageType: MessageType;
  content?: string;
  mediaUrl?: string;
  duration?: number;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessagePayload {
  chatRoomId: string;
  senderId: string;
  senderType: SenderType;
  messageType: MessageType;
  content?: string;
  mediaUrl?: string;
  duration?: number;
}
