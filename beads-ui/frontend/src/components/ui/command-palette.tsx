import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  List,
  GitBranch,
  Search,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');

  // Navigation items
  const navigationItems: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: LayoutDashboard,
      action: () => navigate('/'),
      keywords: ['home', 'overview', 'stats'],
    },
    {
      id: 'issues',
      label: 'Go to Issues',
      icon: List,
      action: () => navigate('/list'),
      keywords: ['list', 'tasks', 'bugs'],
    },
    {
      id: 'graph',
      label: 'Go to Dependencies',
      icon: GitBranch,
      action: () => navigate('/graph'),
      keywords: ['dependencies', 'tree', 'connections'],
    },
  ];

  // Action items
  const actionItems: CommandItem[] = [
    {
      id: 'new-issue',
      label: 'Create New Issue',
      icon: Plus,
      action: () => {
        // Trigger create issue dialog
        window.dispatchEvent(new CustomEvent('create-issue'));
      },
      keywords: ['add', 'new', 'task', 'bug'],
    },
  ];

  const handleSelect = (item: CommandItem) => {
    item.action();
    onOpenChange(false);
    setSearch('');
  };

  // Keyboard shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Command Dialog */}
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg">
        <Command
          className="rounded-lg border bg-popover text-popover-foreground shadow-lg overflow-hidden"
          shouldFilter={true}
        >
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs text-muted-foreground px-2 py-1.5">
              {navigationItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                  onSelect={() => handleSelect(item)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer',
                    'aria-selected:bg-accent aria-selected:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actions" className="text-xs text-muted-foreground px-2 py-1.5 mt-2">
              {actionItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                  onSelect={() => handleSelect(item)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer',
                    'aria-selected:bg-accent aria-selected:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>
              <kbd className="rounded border bg-muted px-1 font-mono">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="rounded border bg-muted px-1 font-mono">↵</kbd> to select
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}

// Hook to use command palette
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);
  return { open, setOpen, toggle: () => setOpen((o) => !o) };
}
