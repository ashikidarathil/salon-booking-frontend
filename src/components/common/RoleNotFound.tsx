import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

interface RoleNotFoundProps {
  role?: 'ADMIN' | 'STYLIST' | 'USER';
  backPath?: string;
  homePath?: string;
}

export function RoleNotFound({ role = 'USER', backPath, homePath }: RoleNotFoundProps) {
  const navigate = useNavigate();

  const config = {
    ADMIN: {
      title: 'Admin Page Not Found',
      description: 'The management page you are looking for does not exist or has been moved.',
      home: '/admin',
      icon: 'solar:shield-warning-bold-duotone',
      color: 'text-primary',
    },
    STYLIST: {
      title: 'Stylist Page Not Found',
      description:
        'The portal page you are looking for is unavailable. Please check your schedule.',
      home: '/stylist',
      icon: 'solar:scissors-bold-duotone',
      color: 'text-primary',
    },
    USER: {
      title: 'Page Not Found',
      description:
        "Don't worry, even the best stylists lose their way sometimes! Let's get you back on track.",
      home: '/',
      icon: 'solar:ghost-bold-duotone',
      color: 'text-primary',
    },
  }[role];

  const finalHomePath = homePath || config.home;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
      <div className="relative mb-8">
        <h1 className="text-9xl font-black opacity-5 select-none tracking-tighter">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`p-4 rounded-3xl bg-white shadow-xl ring-1 ring-black/5`}>
            <Icon icon={config.icon} className={`size-20 ${config.color}`} />
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-3xl font-bold font-heading">{config.title}</h2>
      <p className="max-w-md mx-auto mb-10 text-muted-foreground leading-relaxed">
        {config.description}
      </p>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
        <Button
          size="lg"
          onClick={() => navigate(finalHomePath)}
          className="w-full gap-2 px-8 font-semibold shadow-lg sm:w-auto"
        >
          <Icon icon="solar:home-2-bold" className="size-5" />
          Back to Dashboard
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => (backPath ? navigate(backPath) : navigate(-1))}
          className="w-full gap-2 px-8 font-semibold sm:w-auto"
        >
          <Icon icon="solar:alt-arrow-left-bold" className="size-5" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
