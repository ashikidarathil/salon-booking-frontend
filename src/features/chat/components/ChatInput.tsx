import { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showError } from '@/common/utils/swal.utils';
import { MessageType, SenderType } from '../chat.types';
import type { SendMessagePayload } from '../chat.types';

interface ChatInputProps {
  isConnected: boolean;
  activeRoomId: string | null;
  userId: string;
  isStylist: boolean;
  isClosed: boolean;
  onSendMessage: (payload: SendMessagePayload) => void;
  onUploadMedia: (file: File) => Promise<string>;
}

export function ChatInput({
  isConnected,
  activeRoomId,
  userId,
  isStylist,
  isClosed,
  onSendMessage,
  onUploadMedia,
}: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const handleSend = () => {
    if (!inputText.trim() || isClosed || !activeRoomId) return;
    onSendMessage({
      chatRoomId: activeRoomId,
      senderId: userId,
      senderType: isStylist ? SenderType.STYLIST : SenderType.USER,
      messageType: MessageType.TEXT,
      content: inputText.trim(),
    });
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showError('Upload Error', 'Please select an image file');
      return;
    }
    try {
      setIsUploading(true);
      const mediaUrl = await onUploadMedia(file);
      if (!activeRoomId) return;
      onSendMessage({
        chatRoomId: activeRoomId,
        senderId: userId,
        senderType: isStylist ? SenderType.STYLIST : SenderType.USER,
        messageType: MessageType.IMAGE,
        mediaUrl,
      });
    } catch (err: unknown) {
      showError('Upload Failed', (err as Error).message || 'Image upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      showError('Microphone Error', 'Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleAudioUpload = async (blob: Blob) => {
    try {
      setIsUploading(true);
      const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      const mediaUrl = await onUploadMedia(file);
      if (!activeRoomId) return;
      onSendMessage({
        chatRoomId: activeRoomId,
        senderId: userId,
        senderType: isStylist ? SenderType.STYLIST : SenderType.USER,
        messageType: MessageType.VOICE,
        mediaUrl,
        duration: recordingDuration,
      });
    } catch (err: unknown) {
      showError('Upload Failed', (err as Error).message || 'Voice upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (isClosed) {
    return (
      <div className="p-4 bg-background/80 backdrop-blur border-t border-border/50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon icon="solar:lock-bold-duotone" className="size-4" />
          <span>This chat is closed — messaging is disabled.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 bg-background/80 backdrop-blur border-t border-border/50 sticky bottom-0 shrink-0 w-full max-sm:pb-6">
      <div className="flex items-end gap-2 max-w-4xl mx-auto w-full">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          ref={fileInputRef}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-11 w-11 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-95 transition-all"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isRecording || !isConnected}
        >
          <Icon
            icon={isUploading ? 'solar:spinner-bold-duotone' : 'solar:camera-bold'}
            className={`size-5 ${isUploading ? 'animate-spin opacity-50' : ''}`}
          />
        </Button>

        <div className="flex-1 relative bg-muted/30 rounded-2xl border border-border/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
          {isRecording ? (
            <div className="w-full flex items-center gap-3 px-4 py-3 text-sm animate-pulse">
              <div className="size-2 rounded-full bg-red-500" />
              <span className="font-medium text-red-500">Recording...</span>
              <span className="text-muted-foreground font-mono ml-auto">
                {Math.floor(recordingDuration / 60)}:
                {(recordingDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ) : (
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="w-full bg-transparent border-none min-h-[44px] px-4 py-3 placeholder:text-muted-foreground/60 shadow-none focus-visible:ring-0"
              disabled={!isConnected}
            />
          )}
        </div>

        {isRecording ? (
          <Button
            size="icon"
            onClick={stopRecording}
            className="shrink-0 h-11 w-11 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sm active:scale-95 transition-all animate-in zoom-in"
          >
            <Icon icon="solar:stop-bold" className="size-5" />
          </Button>
        ) : inputText.trim() ? (
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!isConnected}
            className="shrink-0 h-11 w-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-95 transition-all animate-in zoom-in"
          >
            <Icon icon="solar:plain-bold" className="size-5 transform rotate-45 mr-0.5 mt-0.5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-11 w-11 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-primary active:scale-95 transition-all"
            onClick={startRecording}
            disabled={isUploading || !isConnected}
          >
            <Icon icon="solar:microphone-bold" className="size-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
