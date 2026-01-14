import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const priorityBadgeVariants = cva(
  'inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-medium',
  {
    variants: {
      priority: {
        0: 'bg-priority-critical text-white',
        1: 'bg-priority-high text-white',
        2: 'bg-muted text-muted-foreground',
        3: 'bg-muted/50 text-muted-foreground',
        4: 'bg-transparent text-muted-foreground border border-border',
      },
      size: {
        default: 'text-xs px-1.5 py-0.5',
        sm: 'text-[10px] px-1 py-0',
        lg: 'text-sm px-2 py-1',
      },
    },
    defaultVariants: {
      priority: 2,
      size: 'default',
    },
  }
);

export type PriorityLevel = 0 | 1 | 2 | 3 | 4;

const priorityLabels: Record<PriorityLevel, string> = {
  0: 'P0',
  1: 'P1',
  2: 'P2',
  3: 'P3',
  4: 'P4',
};

export interface PriorityBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof priorityBadgeVariants> {
  priority: PriorityLevel;
  showLabel?: boolean;
}

const PriorityBadge = React.forwardRef<HTMLSpanElement, PriorityBadgeProps>(
  ({ className, priority, size, showLabel = true, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(priorityBadgeVariants({ priority, size, className }))}
        {...props}
      >
        {showLabel && priorityLabels[priority]}
      </span>
    );
  }
);
PriorityBadge.displayName = 'PriorityBadge';

export { PriorityBadge, priorityBadgeVariants };
