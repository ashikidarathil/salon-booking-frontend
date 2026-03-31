import { Header } from '@/components/user/Header';
import ChatPage from '@/pages/shared/ChatPage';

export default function UserChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ChatPage />
    </div>
  );
}
