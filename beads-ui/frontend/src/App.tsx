import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Moon, Sun, LayoutDashboard, List, GitBranch, Menu, Command } from 'lucide-react';
import { PageHeader, type BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import {
  CollapsibleSidebar,
  SIDEBAR_WIDTH_EXPANDED,
  SIDEBAR_WIDTH_COLLAPSED,
  type SidebarNavItem,
} from '@/components/ui/collapsible-sidebar';
import DashboardPage from '@/pages/DashboardPage';
import ListPage from '@/pages/ListPage';
import GraphPage from '@/pages/GraphPage';
import { CommandPalette } from '@/components/CommandPalette';
import { cn } from '@/lib/utils';

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

const navItems: SidebarNavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/list', label: 'Issues', icon: List },
  { to: '/graph', label: 'Dependencies', icon: GitBranch },
];

const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Dashboard', icon: LayoutDashboard }],
  '/list': [{ label: 'Issues', icon: List }],
  '/graph': [{ label: 'Dependencies', icon: GitBranch }],
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function SidebarHeader({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0">
        <span className="text-sidebar-accent-foreground font-bold text-sm">B</span>
      </div>
      {!isCollapsed && <span className="font-semibold text-sidebar-foreground">Beads</span>}
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const currentBreadcrumbs = routeBreadcrumbs[location.pathname] || [];

  // Listen for sidebar collapse changes from localStorage
  useEffect(() => {
    const checkCollapsed = () => {
      const isCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
      setSidebarCollapsed(isCollapsed);
    };

    // Check periodically for changes (sidebar toggle updates localStorage)
    const interval = setInterval(checkCollapsed, 100);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for command palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-30">
        <CollapsibleSidebar
          navItems={navItems}
          header={<SidebarHeader isCollapsed={sidebarCollapsed} />}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full z-50 transition-transform duration-200 md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <CollapsibleSidebar
          navItems={navItems}
          header={<SidebarHeader isCollapsed={false} />}
        />
      </div>

      {/* Main area */}
      <div
        className="flex flex-col flex-1 min-h-screen transition-[margin] duration-200 ease-in-out md:ml-[var(--sidebar-width)]"
        style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
      >
        {/* Top Bar - 48px height (h-12) */}
        <header className="h-12 border-b bg-card flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <h1 className="text-lg font-semibold">Beads</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted-foreground"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Command className="h-4 w-4" />
              <span className="text-sm">Search...</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Command className="h-5 w-5" />
              <span className="sr-only">Open command palette</span>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Header with Breadcrumbs - 40px height (h-10) */}
        <PageHeader
          breadcrumbs={currentBreadcrumbs}
          showHomeBreadcrumb={location.pathname !== '/'}
        />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/graph" element={<GraphPage />} />
          </Routes>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
}
