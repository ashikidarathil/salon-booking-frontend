import { Header } from '@/components/user/Header';
import ChatPage from '@/pages/shared/ChatPage';

export default function UserChatPage() {
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ChatPage />
      </div>
    </div>
  );
}
