import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import { RoleNotFound } from '@/components/common/RoleNotFound';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  const isStylist = location.pathname.startsWith('/stylist');
  const role = isAdmin ? 'ADMIN' : isStylist ? 'STYLIST' : 'USER';

  const showHeaderFooter = !isAdmin && !isStylist;

  return (
    <div
      className={`flex flex-col min-h-screen bg-background text-foreground ${!showHeaderFooter ? 'justify-center' : ''}`}
    >
      {showHeaderFooter && <Header />}
      <main
        className={`flex items-center justify-center flex-1 px-4 ${showHeaderFooter ? 'py-20 bg-muted/20' : ''}`}
      >
        <div className="relative w-full max-w-2xl text-center">
          {showHeaderFooter && (
            <div className="absolute top-0 opacity-10 size-80 left-1/2 -translate-x-1/2 blur-3xl bg-primary/30 rounded-full -z-10" />
          )}

          <RoleNotFound role={role} />

          {showHeaderFooter && (
            <div className="grid grid-cols-1 gap-4 mt-12 text-left sm:grid-cols-3">
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
          )}
        </div>
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}
