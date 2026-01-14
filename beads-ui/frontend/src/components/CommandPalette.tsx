import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  GitBranch,
  FileText,
  Search,
  CircleDot,
  Loader2,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge, type PriorityLevel } from '@/components/ui/priority-badge';
import { api, type Issue } from '@/lib/api';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/list', label: 'Issues', icon: List },
  { to: '/graph', label: 'Dependencies', icon: GitBranch },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch issues when search changes
  useEffect(() => {
    if (!open) {
      setSearch('');
      setIssues([]);
      return;
    }

    const fetchIssues = async () => {
      setLoading(true);
      try {
        const results = await api.listIssues({ search: search || undefined });
        setIssues(results.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error('Failed to fetch issues:', error);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(fetchIssues, 150);
    return () => clearTimeout(timer);
  }, [open, search]);

  const handleSelect = useCallback(
    (callback: () => void) => {
      onOpenChange(false);
      callback();
    },
    [onOpenChange]
  );

  const handleNavigate = useCallback(
    (to: string) => {
      handleSelect(() => navigate(to));
    },
    [handleSelect, navigate]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search issues or type a command..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            'No results found.'
          )}
        </CommandEmpty>

        {/* Navigation Commands */}
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.to}
              onSelect={() => handleNavigate(item.to)}
              className="gap-2"
            >
              <item.icon className="h-4 w-4" />
              <span>Go to {item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Issues Results */}
        {issues.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Issues">
              {issues.map((issue) => (
                <CommandItem
                  key={issue.id}
                  value={`${issue.id} ${issue.title}`}
                  onSelect={() => handleNavigate(`/list?issue=${issue.id}`)}
                  className="gap-2"
                >
                  <CircleDot className="h-4 w-4 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        {issue.id}
                      </span>
                      <span className="truncate">{issue.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={issue.status} size="sm" />
                      <PriorityBadge priority={issue.priority as PriorityLevel} size="sm" />
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Quick Actions */}
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => handleNavigate('/list?status=open')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>View open issues</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleNavigate('/list?status=in_progress')}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            <span>View in-progress issues</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleNavigate('/list?status=blocked')}
            className="gap-2"
          >
            <CircleDot className="h-4 w-4" />
            <span>View blocked issues</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
