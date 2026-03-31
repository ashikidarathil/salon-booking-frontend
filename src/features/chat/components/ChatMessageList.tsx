import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { VoicePlayer } from './VoicePlayer';
import { MessageType } from '../chat.types';
import type { ChatMessage, ChatRoom } from '../chat.types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  activeRoom: ChatRoom | undefined;
  userId: string | undefined;
  isLoading: boolean;
  isClosed: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onImageLoad?: () => void;
}

export function ChatMessageList({
  messages,
  activeRoom,
  userId,
  isLoading,
  isClosed,
  messagesEndRef,
  onImageLoad,
}: ChatMessageListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full gap-2">
        <Icon
          icon="solar:spinner-bold-duotone"
          className="size-8 animate-spin text-primary opacity-50"
        />
        <span className="text-sm text-muted-foreground">Loading chat history...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-3">
          <Icon icon="solar:chat-round-line-duotone" className="size-8 opacity-50" />
        </div>
        <p>No messages yet.</p>
        <p className="text-xs max-w-xs mt-1">
          {isClosed
            ? 'This conversation has been closed.'
            : 'Send a message to start the conversation.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 w-full custom-scrollbar">
      {messages.map((msg, index) => {
        const isMine = msg.senderId === userId;
        const isSystem = msg.messageType === MessageType.SYSTEM;
        const showDateStamp =
          index === 0 ||
          format(new Date(msg.createdAt), 'MMM d') !==
            format(new Date(messages[index - 1].createdAt), 'MMM d');

        return (
          <div key={msg.id || index} className="flex flex-col gap-4">
            {showDateStamp && (
              <div className="flex justify-center my-4 sticky top-2 z-10">
                <span className="bg-background/80 backdrop-blur shadow-sm border border-border/50 text-xs px-3 py-1 rounded-full text-muted-foreground font-medium">
                  {format(new Date(msg.createdAt), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
            )}

            {index === 0 && (activeRoom?.bookingNumber || activeRoom?.booking?.bookingNumber) && (
              <div className="flex justify-center my-6">
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
                  Booking #{activeRoom.bookingNumber || activeRoom.booking?.bookingNumber}
                </span>
              </div>
            )}

            {isSystem ? (
              <div className="flex justify-center my-1 w-full">
                <div className="bg-muted/10 px-4 py-2 rounded-xl text-[10px] text-muted-foreground/50 text-center max-w-sm border border-border/10">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className={`flex items-end gap-2 w-full ${isMine ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`flex flex-col max-w-[85%] md:max-w-[70%] ${
                    isMine ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-background border border-border/50 text-foreground rounded-bl-none'
                    }`}
                  >
                    {msg.messageType === MessageType.IMAGE && msg.mediaUrl ? (
                      <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={msg.mediaUrl}
                          alt="Chat attachment"
                          className="max-sm:max-w-48 max-w-sm rounded-lg object-contain bg-muted/20"
                          loading="lazy"
                          onLoad={onImageLoad}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://placehold.co/400x300?text=Image+Not+Found';
                            onImageLoad?.();
                          }}
                        />
                      </a>
                    ) : msg.messageType === MessageType.VOICE && msg.mediaUrl ? (
                      <VoicePlayer src={msg.mediaUrl} duration={msg.duration} />
                    ) : msg.messageType === MessageType.TEXT ? (
                      <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 mx-1 opacity-40">
                    {format(new Date(msg.createdAt), 'h:mm a')}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
