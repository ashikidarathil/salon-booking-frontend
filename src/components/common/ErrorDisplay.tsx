import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

interface ErrorDisplayProps {
  error: string | null;
  resetError?: () => void;
  backPath?: string;
  title?: string;
}

export function ErrorDisplay({
  error,
  resetError,
  backPath = '/services',
  title = 'Something went wrong',
}: ErrorDisplayProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (resetError) resetError();
    navigate(backPath);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
      <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-50">
        <Icon icon="solar:danger-bold" className="text-red-500 size-10" />
      </div>
      <h2 className="mb-2 text-2xl font-bold font-heading">{title}</h2>
      <p className="max-w-md mb-8 text-muted-foreground">
        {error || 'An unexpected error occurred. Please try again later.'}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {resetError && (
          <Button onClick={resetError} variant="outline" className="gap-2">
            <Icon icon="solar:refresh-bold" className="size-4" />
            Try Again
          </Button>
        )}
        <Button onClick={handleBack} className="gap-2">
          <Icon icon="solar:alt-arrow-left-bold" className="size-4" />
          Back to Safety
        </Button>
      </div>
    </div>
  );
}
