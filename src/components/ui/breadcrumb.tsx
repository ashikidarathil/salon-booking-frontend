import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-primary transition-colors">
        <Icon icon="solar:home-2-bold" className="size-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Icon icon="solar:alt-arrow-right-linear" className="size-3" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-primary transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
