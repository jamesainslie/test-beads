import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, showHome = true, className, ...props }, ref) => {
    const allItems: BreadcrumbItem[] = showHome
      ? [{ label: 'Home', href: '/', icon: Home }, ...items]
      : items;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center text-sm', className)}
        {...props}
      >
        <ol className="flex items-center gap-1">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const Icon = item.icon;

            return (
              <li key={item.label} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-text-muted flex-shrink-0" />
                )}
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="flex items-center gap-1.5 text-text-muted hover:text-text transition-colors"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'flex items-center gap-1.5',
                      isLast ? 'text-text font-medium' : 'text-text-muted'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showHomeBreadcrumb?: boolean;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ breadcrumbs = [], actions, showHomeBreadcrumb = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'h-10 flex items-center justify-between px-6 border-b bg-surface-raised sticky top-12 z-10',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          {breadcrumbs.length > 0 && (
            <Breadcrumb items={breadcrumbs} showHome={showHomeBreadcrumb} />
          )}
          {children}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';

export { Breadcrumb, PageHeader };
