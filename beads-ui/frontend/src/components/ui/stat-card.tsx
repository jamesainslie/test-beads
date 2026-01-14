import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export type StatusType = 'open' | 'in_progress' | 'blocked' | 'closed';

export interface StatCardProps {
  status: StatusType;
  count: number;
  trend?: number; // Positive = up, negative = down, 0 or undefined = neutral
  trendLabel?: string;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { label: string; color: string; dotColor: string; borderClass?: string }
> = {
  open: {
    label: 'Open',
    color: 'text-status-open',
    dotColor: 'bg-status-open',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-status-in-progress',
    dotColor: 'bg-status-in-progress',
  },
  blocked: {
    label: 'Blocked',
    color: 'text-status-blocked',
    dotColor: 'bg-status-blocked',
    borderClass: 'border-l-4 border-l-amber-500',
  },
  closed: {
    label: 'Closed',
    color: 'text-status-closed',
    dotColor: 'bg-status-closed',
  },
};

export function StatCard({
  status,
  count,
  trend,
  trendLabel = 'vs last week',
  className,
}: StatCardProps) {
  const navigate = useNavigate();
  const config = statusConfig[status];

  const handleClick = () => {
    navigate(`/list?status=${status}`);
  };

  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
        ? TrendingUp
        : TrendingDown;

  const trendColor =
    trend === undefined || trend === 0
      ? 'text-muted-foreground'
      : trend > 0
        ? status === 'blocked'
          ? 'text-red-500' // More blocked = bad
          : 'text-green-500' // More open/in_progress/closed = neutral to good
        : status === 'blocked'
          ? 'text-green-500' // Less blocked = good
          : 'text-muted-foreground';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:border-foreground/20',
        config.borderClass,
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full', config.dotColor)} />
            <span className="text-sm font-medium text-muted-foreground">
              {config.label}
            </span>
          </div>
          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>
                {trend > 0 ? '+' : ''}
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="mt-2">
          <span className={cn('text-3xl font-bold', config.color)}>{count}</span>
        </div>
        {trend !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">{trendLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

StatCard.displayName = 'StatCard';
