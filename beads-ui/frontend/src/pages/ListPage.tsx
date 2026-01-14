import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateIssueDialog } from '@/components/CreateIssueDialog';
import { api, type Issue } from '@/lib/api';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-500',
  in_progress: 'bg-blue-500',
  blocked: 'bg-red-500',
  closed: 'bg-gray-500',
};

const PRIORITY_LABELS: Record<number, string> = {
  0: 'P0',
  1: 'P1',
  2: 'P2',
  3: 'P3',
  4: 'P4',
};

export default function ListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: issues = [], isLoading, error } = useQuery<Issue[]>({
    queryKey: ['issues', { search, status: statusFilter }],
    queryFn: () =>
      api.listIssues({
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof api.updateIssue>[1]) => api.updateIssue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => api.closeIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setSelectedIssue(null);
    },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <AlertCircle className="h-5 w-5 mr-2" />
        Failed to load issues
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main List */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Issues</CardTitle>
              <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Issue
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No issues found</div>
            ) : (
              <div className="divide-y">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={cn(
                      'py-3 px-2 -mx-2 rounded cursor-pointer transition-colors',
                      selectedIssue?.id === issue.id
                        ? 'bg-accent'
                        : 'hover:bg-accent/50'
                    )}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          STATUS_COLORS[issue.status]
                        )}
                      />
                      <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                        {issue.id}
                      </span>
                      <span className="flex-1 truncate font-medium">{issue.title}</span>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-secondary">
                        {PRIORITY_LABELS[issue.priority] || 'P2'}
                      </span>
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        {issue.assignee || '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Panel */}
      {selectedIssue && (
        <Card className="w-96 shrink-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg truncate">{selectedIssue.id}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIssue(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <select
                value={selectedIssue.status}
                onChange={(e) =>
                  updateMutation.mutate({ id: selectedIssue.id, status: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <select
                value={selectedIssue.priority}
                onChange={(e) =>
                  updateMutation.mutate({ id: selectedIssue.id, priority: parseInt(e.target.value) })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="0">P0 - Critical</option>
                <option value="1">P1 - High</option>
                <option value="2">P2 - Medium</option>
                <option value="3">P3 - Low</option>
                <option value="4">P4 - Backlog</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <input
                type="text"
                value={selectedIssue.title}
                onChange={(e) =>
                  updateMutation.mutate({ id: selectedIssue.id, title: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <textarea
                value={selectedIssue.description || ''}
                onChange={(e) =>
                  updateMutation.mutate({ id: selectedIssue.id, description: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm min-h-24 resize-none"
              />
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Assignee</label>
              <input
                type="text"
                value={selectedIssue.assignee || ''}
                placeholder="Unassigned"
                onChange={(e) =>
                  updateMutation.mutate({
                    id: selectedIssue.id,
                    assignee: e.target.value || undefined,
                  })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
              />
            </div>

            {/* Labels */}
            {selectedIssue.labels && selectedIssue.labels.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Labels</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedIssue.labels.map((label) => (
                    <span
                      key={label}
                      className="px-2 py-1 text-xs rounded-full bg-secondary"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              {selectedIssue.status !== 'closed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => closeMutation.mutate(selectedIssue.id)}
                  disabled={closeMutation.isPending}
                >
                  Close Issue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <CreateIssueDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
