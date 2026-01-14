import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';
export const SIDEBAR_WIDTH_EXPANDED = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 64;

interface SidebarContextValue {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a CollapsibleSidebar');
  }
  return context;
}

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface CollapsibleSidebarProps {
  children?: React.ReactNode;
  navItems?: SidebarNavItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function CollapsibleSidebar({
  children,
  navItems,
  header,
  footer,
  className,
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsedState] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === 'true';
  });

  const setIsCollapsed = React.useCallback((collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, []);

  const toggle = React.useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  const contextValue = React.useMemo(
    () => ({ isCollapsed, setIsCollapsed, toggle }),
    [isCollapsed, setIsCollapsed, toggle]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        className={cn(
          'flex flex-col h-full bg-card border-r transition-all duration-200',
          className
        )}
        style={{
          width: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
          minWidth: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        }}
      >
        {/* Header */}
        {header && (
          <div className="flex items-center h-12 px-4 border-b">
            {header}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems?.map((item) => (
            <SidebarNavLink key={item.to} {...item} />
          ))}
          {children}
        </nav>

        {/* Footer with collapse toggle */}
        <div className="border-t">
          {footer}
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className={cn(
                'w-full justify-center text-muted-foreground hover:text-foreground',
                !isCollapsed && 'justify-end'
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <span className="text-xs mr-2">Collapse</span>
                  <ChevronLeft className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}

interface SidebarNavLinkProps extends SidebarNavItem {}

export function SidebarNavLink({ to, label, icon: Icon }: SidebarNavLinkProps) {
  const location = useLocation();
  const { isCollapsed } = useSidebar();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
        'text-muted-foreground hover:text-foreground hover:bg-accent',
        isActive && 'text-foreground bg-accent',
        isCollapsed && 'justify-center px-0'
      )}
      title={isCollapsed ? label : undefined}
    >
      {/* Active indicator - amber left border */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-500 rounded-full" />
      )}
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

CollapsibleSidebar.displayName = 'CollapsibleSidebar';
SidebarNavLink.displayName = 'SidebarNavLink';
