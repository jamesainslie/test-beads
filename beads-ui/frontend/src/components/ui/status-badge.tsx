import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 text-xs font-medium',
  {
    variants: {
      status: {
        open: 'text-green-700 dark:text-green-400',
        in_progress: 'text-yellow-700 dark:text-yellow-400',
        blocked: 'text-red-700 dark:text-red-400',
        closed: 'text-muted-foreground',
      },
      size: {
        default: 'text-xs',
        sm: 'text-[10px]',
        lg: 'text-sm',
      },
    },
    defaultVariants: {
      status: 'open',
      size: 'default',
    },
  }
);

const dotVariants = cva('rounded-full flex-shrink-0', {
  variants: {
    status: {
      open: 'bg-green-500',
      in_progress: 'bg-yellow-500',
      blocked: 'bg-red-500',
      closed: 'bg-muted-foreground',
    },
    size: {
      default: 'h-2 w-2',
      sm: 'h-1.5 w-1.5',
      lg: 'h-2.5 w-2.5',
    },
  },
  defaultVariants: {
    status: 'open',
    size: 'default',
  },
});

export type StatusType = 'open' | 'in_progress' | 'blocked' | 'closed';

const statusLabels: Record<StatusType, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  closed: 'Closed',
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: StatusType;
  showLabel?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, size, showLabel = true, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ status, size, className }))}
        {...props}
      >
        <span className={cn(dotVariants({ status, size }))} />
        {showLabel && <span>{statusLabels[status]}</span>}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge, statusBadgeVariants };
