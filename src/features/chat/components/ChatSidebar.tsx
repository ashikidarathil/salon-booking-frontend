import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import type { ChatRoom } from '../chat.types';

interface ChatSidebarProps {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  isStylist: boolean;
  onSearch?: (query: string) => void;
}

export function ChatSidebar({
  rooms,
  activeRoomId,
  onRoomSelect,
  isStylist,
  onSearch,
}: ChatSidebarProps) {
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

  const bookingRef = (room: ChatRoom) => room.bookingNumber || room.booking?.bookingNumber;

  return (
    <div
      className={`w-full md:w-80 border-r border-border/50 flex flex-col ${
        activeRoomId ? 'hidden md:flex' : 'flex'
      }`}
    >
      <div className="p-4 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur z-10">
        <h2 className="text-xl font-bold">Messages</h2>
        <div className="relative mt-3">
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4"
          />
          <Input
            placeholder="Search conversations..."
            className="bg-muted/50 border-none pl-9"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <Icon icon="solar:chat-round-line-duotone" className="size-12 mb-2 opacity-20" />
            <p>No conversations yet.</p>
          </div>
        ) : (
          [...rooms]
            .sort((a, b) => {
              const timeA = new Date(a.lastMessageAt || a.updatedAt).getTime();
              const timeB = new Date(b.lastMessageAt || b.updatedAt).getTime();
              return timeB - timeA;
            })
            .map((room) => {
              const partner = getPartnerDetails(room);
              const isActive = activeRoomId === room.id;
              const closed = room.status === 'CLOSED';
              const ref = bookingRef(room);
              return (
                <div
                  key={room.id}
                  onClick={() => onRoomSelect(room.id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50 border-b border-border/20 ${
                    isActive
                      ? 'bg-primary/10 border-r-2 border-r-primary'
                      : room.unreadCount && room.unreadCount > 0
                        ? 'bg-primary/5'
                        : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-12 rounded-xl ring-2 ring-primary/10 bg-background">
                      <AvatarImage src={partner.pic} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {partner.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {room.unreadCount !== undefined && room.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 size-4 bg-primary text-[10px] text-white font-bold rounded-full flex items-center justify-center ring-2 ring-background ring-offset-0 animate-in zoom-in-50 duration-300">
                        {room.unreadCount > 9 ? '9+' : room.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="font-semibold text-sm truncate pr-2">{partner.name}</h4>
                      {room.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(room.lastMessageAt), 'MMM d, h:mm a')}
                        </span>
                      )}
                    </div>
                    {ref && (
                      <p className="text-[10px] text-muted-foreground font-mono mb-0.5">
                        #{ref}
                        {closed && (
                          <span className="ml-1.5 text-[9px] bg-muted/80 px-1.5 py-0.5 rounded-full text-muted-foreground border border-border/40">
                            Closed
                          </span>
                        )}
                      </p>
                    )}
                    <p
                      className={`text-xs truncate ${
                        isActive
                          ? 'text-primary'
                          : room.unreadCount && room.unreadCount > 0
                            ? 'text-foreground font-semibold'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {room.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
