const API_BASE = '/api';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'blocked' | 'closed';
  priority: number;
  issue_type: string;
  assignee: string | null;
  labels: string[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  blocked_by?: string[];
  blocks?: string[];
}

export interface Stats {
  statusCounts: {
    open: number;
    in_progress: number;
    blocked: number;
    closed: number;
  };
  priorityCounts: Record<number, number>;
  typeCounts: Record<string, number>;
  assigneeCounts: Record<string, number>;
  closedByDate: Record<string, number>;
  blockedIssues: Issue[];
  totalIssues: number;
}

export interface GraphData {
  nodes: Array<{
    id: string;
    title: string;
    status: string;
    priority: number;
    type: string;
    assignee: string | null;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
  }>;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Issues
  listIssues: (filters?: {
    status?: string;
    type?: string;
    priority?: number;
    assignee?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.priority !== undefined) params.set('priority', String(filters.priority));
    if (filters?.assignee) params.set('assignee', filters.assignee);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    return fetchAPI<Issue[]>(`/issues${query ? `?${query}` : ''}`);
  },

  getIssue: (id: string) => fetchAPI<Issue>(`/issues/${id}`),

  createIssue: (data: {
    title: string;
    description?: string;
    issue_type?: string;
    priority?: number;
    assignee?: string;
  }) =>
    fetchAPI<Issue>('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateIssue: (
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: number;
      assignee?: string;
      issue_type?: string;
    }
  ) =>
    fetchAPI<Issue>(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  closeIssue: (id: string, reason?: string) =>
    fetchAPI<Issue>(`/issues/${id}/close`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  deleteIssue: (id: string) =>
    fetchAPI<void>(`/issues/${id}`, {
      method: 'DELETE',
    }),

  // Labels
  addLabel: (id: string, label: string) =>
    fetchAPI<void>(`/issues/${id}/labels`, {
      method: 'POST',
      body: JSON.stringify({ label }),
    }),

  removeLabel: (id: string, label: string) =>
    fetchAPI<void>(`/issues/${id}/labels/${encodeURIComponent(label)}`, {
      method: 'DELETE',
    }),

  // Stats
  getStats: () => fetchAPI<Stats>('/stats'),

  // Dependencies
  getDependencies: () => fetchAPI<GraphData>('/dependencies'),

  addDependency: (fromId: string, toId: string) =>
    fetchAPI<void>(`/dependencies/${fromId}/depends-on/${toId}`, {
      method: 'POST',
    }),

  removeDependency: (fromId: string, toId: string) =>
    fetchAPI<void>(`/dependencies/${fromId}/depends-on/${toId}`, {
      method: 'DELETE',
    }),
};
