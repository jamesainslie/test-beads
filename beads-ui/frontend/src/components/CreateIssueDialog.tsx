import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface CreateIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateIssueDialog({ open, onOpenChange }: CreateIssueDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('task');
  const [priority, setPriority] = useState(2);
  const [assignee, setAssignee] = useState('');

  const createMutation = useMutation({
    mutationFn: api.createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      onOpenChange(false);
      // Reset form
      setTitle('');
      setDescription('');
      setIssueType('task');
      setPriority(2);
      setAssignee('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      issue_type: issueType,
      priority,
      assignee: assignee.trim() || undefined,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">Create New Issue</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title"
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Issue description"
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm min-h-20 resize-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="epic">Epic</option>
                <option value="chore">Chore</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="0">P0 - Critical</option>
                <option value="1">P1 - High</option>
                <option value="2">P2 - Medium</option>
                <option value="3">P3 - Low</option>
                <option value="4">P4 - Backlog</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm font-medium">Assignee</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Leave empty for unassigned"
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
                {createMutation.isPending ? 'Creating...' : 'Create Issue'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
