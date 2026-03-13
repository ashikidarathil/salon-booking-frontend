import { useState, useRef } from 'react';
import { Icon } from '@iconify/react';

interface VoicePlayerProps {
  src: string;
  duration?: number;
}

export function VoicePlayer({ src, duration }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const formatDur = (secs?: number) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 min-w-[160px] max-w-[240px] py-1">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (audio && audio.duration) {
            setProgress((audio.currentTime / audio.duration) * 100);
          }
        }}
        className="hidden"
      />
      <button
        onClick={toggle}
        className="shrink-0 size-8 rounded-full bg-current/10 flex items-center justify-center hover:opacity-80 transition-opacity"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        <Icon icon={isPlaying ? 'solar:pause-bold' : 'solar:play-bold'} className="size-4" />
      </button>
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="h-1 rounded-full bg-current/20 overflow-hidden">
          <div
            className="h-full bg-current/60 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] opacity-60">{formatDur(duration)}</span>
      </div>
    </div>
  );
}
