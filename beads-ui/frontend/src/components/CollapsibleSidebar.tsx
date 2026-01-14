import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIDEBAR_STORAGE_KEY = 'beads-sidebar-collapsed';
const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 64;

export interface SidebarItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface CollapsibleSidebarProps {
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === 'true';
  });

  const toggle = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { isCollapsed, toggle };
}

function SidebarNavItem({
  item,
  isCollapsed,
  isActive,
}: {
  item: SidebarItem;
  isCollapsed: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
        'hover:bg-sidebar-accent',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-amber-500 -ml-[2px] pl-[14px]'
          : 'text-sidebar-muted hover:text-sidebar-foreground',
        isCollapsed && 'justify-center px-0'
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && (
        <span className="truncate">{item.label}</span>
      )}
    </Link>
  );
}

export function CollapsibleSidebar({
  items,
  header,
  footer,
  className,
}: CollapsibleSidebarProps) {
  const { isCollapsed, toggle } = useSidebarState();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-200',
        className
      )}
      style={{
        width: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        minWidth: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      }}
    >
      {/* Header */}
      {header && (
        <div className={cn(
          'flex items-center h-14 px-4 border-b border-sidebar-border',
          isCollapsed && 'justify-center px-2'
        )}>
          {header}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.to}
            item={item}
            isCollapsed={isCollapsed}
            isActive={location.pathname === item.to}
          />
        ))}
      </nav>

      {/* Footer with collapse toggle */}
      <div className={cn(
        'border-t border-sidebar-border p-3',
        isCollapsed && 'px-2'
      )}>
        {footer && !isCollapsed && (
          <div className="mb-3">{footer}</div>
        )}
        <button
          onClick={toggle}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm',
            'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
            'transition-colors duration-200',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export { useSidebarState, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED };
