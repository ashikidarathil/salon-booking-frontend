import { useEffect, useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatService from '@/services/chat.service';
import { MessageType, SenderType } from '@/features/chat/chat.types';
import type { ChatRoom, ChatMessage } from '@/features/chat/chat.types';
import { format } from 'date-fns';
import { showApiError } from '@/common/utils/swal.utils';

export default function AdminChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const data = await ChatService.getAdminRooms();
      setRooms(data);
    } catch (error) {
      showApiError(error, 'Failed to fetch chat rooms');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      setIsLoadingMessages(true);
      const data = await ChatService.getRoomMessages(roomId);
      setMessages(data);
    } catch (error) {
      showApiError(error, 'Failed to fetch messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const getSenderName = (message: ChatMessage) => {
    if (message.senderType === SenderType.SYSTEM) return 'System';
    if (message.senderType === SenderType.STYLIST)
      return activeRoom?.stylist?.name || activeRoom?.stylistName || 'Stylist';
    if (message.senderType === SenderType.USER)
      return activeRoom?.user?.name || activeRoom?.userName || 'User';
    return 'Unknown';
  };

  const isChatExpired = (room: ChatRoom) => {
    if (!room.booking) return false;
    const { status, completedAt, cancelledAt } = room.booking;
    if (status !== 'COMPLETED' && status !== 'CANCELLED') return false;
    const actionAt = status === 'COMPLETED' ? completedAt : cancelledAt;
    if (!actionAt) return false;
    const expiryWindow = 24 * 60 * 60 * 1000;
    return new Date().getTime() - new Date(actionAt).getTime() > expiryWindow;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Rooms List */}
      <Card className="w-1/3 flex flex-col overflow-hidden">
        <CardHeader className="py-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon icon="solar:chat-round-bold" className="size-5 text-primary" />
            Support Chats
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {isLoadingRooms ? (
              <div className="p-8 text-center">
                <Icon
                  icon="solar:restart-bold"
                  className="size-8 animate-spin mx-auto text-muted-foreground"
                />
                <p className="mt-2 text-sm text-muted-foreground">Loading rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center">
                <Icon
                  icon="solar:chat-square-broken"
                  className="size-12 mx-auto text-muted-foreground/30"
                />
                <p className="mt-2 text-sm text-muted-foreground">No active chats found</p>
              </div>
            ) : (
              <div className="divide-y">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room)}
                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center gap-3 ${
                      activeRoom?.id === room.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="size-10 border">
                        <AvatarImage src={room.user?.profilePicture || undefined} />
                        <AvatarFallback>{room.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        <Avatar className="size-6 border-2 border-background">
                          <AvatarImage src={room.stylist?.profilePicture || undefined} />
                          <AvatarFallback>{room.stylist?.name?.charAt(0) || 'S'}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">
                            {room.user?.name} & {room.stylist?.name}
                          </p>
                          {isChatExpired(room) && (
                            <Badge
                              variant="outline"
                              className="text-[9px] h-4 px-1 bg-gray-100 text-gray-500 border-gray-200"
                            >
                              Closed
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {room.lastMessageAt
                            ? format(new Date(room.lastMessageAt), 'MMM d, p')
                            : ''}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        Booking: #{room.booking?.bookingNumber}
                      </p>
                      <p className="text-xs text-foreground/80 truncate mt-1">
                        {room.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages View */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {activeRoom ? (
          <>
            <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border">
                  <AvatarImage src={activeRoom.user?.profilePicture || undefined} />
                  <AvatarFallback>{activeRoom.user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">
                    {activeRoom.user?.name} x {activeRoom.stylist?.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Booking:{' '}
                    <Badge variant="outline" className="text-[10px] px-1 h-4">
                      #{activeRoom.booking?.bookingNumber}
                    </Badge>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMessages(activeRoom.id)}
                disabled={isLoadingMessages}
              >
                <Icon
                  icon="solar:restart-bold"
                  className={`size-4 mr-2 ${isLoadingMessages ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 relative">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4 pb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.senderType === SenderType.USER
                          ? 'items-start'
                          : msg.senderType === SenderType.STYLIST
                            ? 'items-end'
                            : 'items-center'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {getSenderName(msg)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg.createdAt), 'p')}
                        </span>
                      </div>

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                          msg.senderType === SenderType.USER
                            ? 'bg-muted rounded-tl-none'
                            : msg.senderType === SenderType.STYLIST
                              ? 'bg-primary text-primary-foreground rounded-tr-none'
                              : 'bg-orange-100 text-orange-800 text-xs italic border border-orange-200'
                        }`}
                      >
                        {msg.messageType === MessageType.TEXT && <p>{msg.content}</p>}
                        {msg.messageType === MessageType.SYSTEM && <p>{msg.content}</p>}
                        {msg.messageType === MessageType.IMAGE && (
                          <div className="rounded-lg overflow-hidden border border-black/5">
                            <img
                              src={msg.mediaUrl}
                              alt="Shared image"
                              className="max-w-full h-auto"
                            />
                          </div>
                        )}
                        {msg.messageType === MessageType.VOICE && (
                          <div
                            className={`flex items-center gap-3 px-2 py-1 ${msg.senderType === SenderType.STYLIST ? 'text-white' : ''}`}
                          >
                            <Icon icon="solar:play-circle-bold" className="size-8" />
                            <div className="flex-1">
                              <div className="h-1 bg-current/20 rounded-full w-24 overflow-hidden">
                                <div className="h-full bg-current w-1/3" />
                              </div>
                              <p className="text-[10px] mt-1 opacity-70">
                                Voice message ({msg.duration}s)
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-white/10"
                              asChild
                            >
                              <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                                <Icon icon="solar:download-bold" className="size-4" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {isLoadingMessages && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[1px]">
                  <Icon icon="solar:restart-bold" className="size-10 animate-spin text-primary" />
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="size-20 bg-muted flex items-center justify-center rounded-full mb-4">
              <Icon icon="solar:chat-round-bold" className="size-10 opacity-20" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Dispute Resolution Chat</h3>
            <p className="max-w-sm mt-2">
              Select a conversation from the sidebar to monitor customer-stylist interactions.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
