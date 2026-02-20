import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex items-center justify-center flex-1 px-4 py-20 bg-muted/20">
        <div className="relative w-full max-w-2xl text-center">
          {/* Abstract background elements */}
          <div className="absolute top-0 opacity-10 size-80 left-1/2 -translate-x-1/2 blur-3xl bg-primary/30 rounded-full -z-10" />

          <div className="mb-8">
            <h1 className="mb-4 text-9xl font-black text-primary/10 tracking-tighter">404</h1>
            {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-xl">
              <Icon icon="solar:ghost-bold" className="text-primary size-16 animate-bounce" />
            </div> */}
          </div>

          <h2 className="mb-4 text-4xl font-bold font-heading">Page Not Found</h2>
          <p className="max-w-md mx-auto mb-10 text-lg text-muted-foreground">
            The link might be broken, or the page may have been removed. Don't worry, even the best
            stylists lose their way sometimes!
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="w-full gap-2 px-8 font-semibold shadow-lg sm:w-auto bg-primary hover:bg-primary/90 shadow-primary/20"
            >
              <Icon icon="solar:home-2-bold" className="size-5" />
              Go to Homepage
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="w-full gap-2 px-8 font-semibold sm:w-auto border-border"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="size-5" />
              Go Back
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-16 text-left sm:grid-cols-3">
            <button
              onClick={() => navigate('/services')}
              className="flex items-center gap-3 p-4 transition-colors border rounded-xl hover:bg-white hover:shadow-md group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-50 text-pink-500 group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon icon="solar:scissors-square-bold" className="size-5" />
              </div>
              <div>
                <span className="block text-sm font-bold leading-none mb-1">Services</span>
                <span className="text-xs text-muted-foreground">Browse styles</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/branches')}
              className="flex items-center gap-3 p-4 transition-colors border rounded-xl hover:bg-white hover:shadow-md group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-500 group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon icon="solar:map-point-bold" className="size-5" />
              </div>
              <div>
                <span className="block text-sm font-bold leading-none mb-1">Branches</span>
                <span className="text-xs text-muted-foreground">Find salons</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="flex items-center gap-3 p-4 transition-colors border rounded-xl hover:bg-white hover:shadow-md group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon icon="solar:chat-line-bold" className="size-5" />
              </div>
              <div>
                <span className="block text-sm font-bold leading-none mb-1">Support</span>
                <span className="text-xs text-muted-foreground">Get help</span>
              </div>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
