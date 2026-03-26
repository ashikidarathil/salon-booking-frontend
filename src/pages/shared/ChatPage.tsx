import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import {
  fetchUserRooms,
  fetchStylistRooms,
  fetchRoomMessages,
  uploadChatMedia,
  markRoomMessagesAsRead,
} from '@/features/chat/chat.thunks';
import { fetchTotalUnreadCount } from '@/features/chat/chat.thunks';
import { markAllNotificationsAsRead } from '@/features/notification/state/notification.thunks';
import { useChat } from '@/features/chat/hooks/useChat';
import type { ChatRoom, SendMessagePayload } from '@/features/chat/chat.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { ChatSidebar } from '@/features/chat/components/ChatSidebar';
import { ChatMessageList } from '@/features/chat/components/ChatMessageList';
import { ChatInput } from '@/features/chat/components/ChatInput';
import { CHAT_UI } from '@/features/chat/chat.constants';
import type { RootState } from '@/app/store';

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  const { rooms, messagesByRoom, isLoadingMessages } = useAppSelector(
    (state: RootState) => state.chat,
  );

  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => {
    return new URLSearchParams(location.search).get('roomId');
  });

  const isStylist = user?.role === 'STYLIST';
  const isUser = user?.role === 'USER';

  const { isConnected, sendMessage, joinRoom } = useChat(user?.id) as ReturnType<typeof useChat>;

  const activeRoom = rooms.find((r: ChatRoom) => r.id === activeRoomId);
  const currentMessages = activeRoomId ? messagesByRoom[activeRoomId] || [] : [];
  const isClosed = activeRoom?.status === 'CLOSED';

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch rooms on mount and when search changes
  useEffect(() => {
    if (isStylist) {
      dispatch(fetchStylistRooms(debouncedQuery));
    } else if (isUser) {
      dispatch(fetchUserRooms(debouncedQuery));
    }
  }, [dispatch, isStylist, isUser, debouncedQuery]);

  // Handle room state on selection
  useEffect(() => {
    if (activeRoomId) {
      dispatch(fetchRoomMessages({ roomId: activeRoomId }));
      dispatch(markRoomMessagesAsRead(activeRoomId)).then(() => {
        dispatch(fetchTotalUnreadCount());
      });
      dispatch(markAllNotificationsAsRead());
    }
  }, [activeRoomId, dispatch]);

  useEffect(() => {
    if (activeRoomId && isConnected) joinRoom(activeRoomId);
  }, [activeRoomId, isConnected, joinRoom]);

  const handleSendMessage = useCallback(
    (payload: SendMessagePayload) => {
      sendMessage(payload);
    },
    [sendMessage],
  );

  const handleUploadMedia = useCallback(
    async (file: File) => {
      if (!activeRoomId) throw new Error('No active room');
      return await dispatch(uploadChatMedia({ roomId: activeRoomId, file })).unwrap();
    },
    [dispatch, activeRoomId],
  );

  const getPartnerDetails = (room: ChatRoom) => {
    if (isStylist) {
      return {
        name: room.user?.name || room.userName || 'Customer',
        pic: room.user?.profilePicture || room.userProfilePic,
      };
    }
    return {
      name: room.stylist?.name || room.stylistName || 'Stylist',
      pic: room.stylist?.profilePicture || room.stylistProfilePic,
    };
  };

  const bookingRef = activeRoom?.bookingNumber || activeRoom?.booking?.bookingNumber;

  return (
    <div
      className={`flex h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-background${isStylist ? ' rounded-lg bg-muted/30 border border-border/40 overflow-hidden' : ''}`}
    >
      <ChatSidebar
        rooms={rooms}
        activeRoomId={activeRoomId}
        isStylist={isStylist}
        onSearch={setSearchQuery}
        onRoomSelect={(id) => {
          setActiveRoomId(id);
          navigate(`?roomId=${id}`, { replace: true });
        }}
      />

      <div
        className={`flex-1 flex flex-col w-full h-full bg-muted/10 relative ${!activeRoomId ? 'hidden md:flex' : 'flex'}`}
      >
        {!activeRoomId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="size-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Icon icon="solar:chat-round-dots-bold-duotone" className="size-12 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-1">{CHAT_UI.MAIN_TITLE}</h3>
            <p>Select a conversation from the sidebar to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-16 shrink-0 border-b border-border/50 bg-background/80 backdrop-blur flex items-center px-4 md:px-6 justify-between sticky top-0 z-10 w-full">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden -ml-2 shrink-0"
                  onClick={() => {
                    setActiveRoomId(null);
                    navigate('?', { replace: true });
                  }}
                >
                  <Icon icon="solar:arrow-left-bold" className="size-5" />
                </Button>
                {activeRoom &&
                  (() => {
                    const partner = getPartnerDetails(activeRoom);
                    return (
                      <>
                        <Avatar className="size-10 rounded-full shrink-0 border border-border/50">
                          <AvatarImage src={partner.pic} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {partner.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-sm leading-none">{partner.name}</h3>
                          {bookingRef && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Booking #{bookingRef}
                              {isClosed && (
                                <span className="ml-2 text-[10px] bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded-full">
                                  Closed
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </>
                    );
                  })()}
              </div>
            </div>

            {isClosed && (
              <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b border-red-100 text-red-600 text-sm">
                <Icon icon="solar:lock-bold-duotone" className="size-4 shrink-0" />
                <span>This chat has been closed.</span>
              </div>
            )}

            <ChatMessageList
              messages={currentMessages}
              activeRoom={activeRoom}
              userId={user?.id}
              isLoading={isLoadingMessages}
              isClosed={isClosed}
              messagesEndRef={messagesEndRef}
            />

            {!isClosed && (
              <ChatInput
                isConnected={isConnected}
                activeRoomId={activeRoomId}
                userId={user?.id || ''}
                isStylist={isStylist}
                isClosed={isClosed}
                onSendMessage={handleSendMessage}
                onUploadMedia={handleUploadMedia}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
