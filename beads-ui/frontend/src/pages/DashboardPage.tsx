import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { api, type Stats } from '@/lib/api';
import { AlertCircle, Loader2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  open: '#22c55e',
  in_progress: '#3b82f6',
  blocked: '#ef4444',
  closed: '#6b7280',
};

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: api.getStats,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <AlertCircle className="h-5 w-5 mr-2" />
        Failed to load dashboard data
      </div>
    );
  }

  if (!stats) return null;

  // Prepare status chart data
  const statusData = Object.entries(stats.statusCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
    color: STATUS_COLORS[name] || '#6b7280',
  }));

  // Prepare burndown data
  const burndownData = Object.entries(stats.closedByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14) // Last 14 days
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      closed: count,
    }));

  // Prepare assignee data
  const assigneeData = Object.entries(stats.assigneeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({
      name: name || 'Unassigned',
      count,
    }));

  return (
    <div className="space-y-6">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard status="open" count={stats.statusCounts.open} />
        <StatCard status="in_progress" count={stats.statusCounts.in_progress} />
        <StatCard status="blocked" count={stats.statusCounts.blocked} />
        <StatCard status="closed" count={stats.statusCounts.closed} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
      {/* Issues by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Issues by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            {statusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Burndown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Issues Closed (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {burndownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="closed"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No closed issues yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Blocked Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto">
            {stats.blockedIssues.length > 0 ? (
              <div className="space-y-3">
                {stats.blockedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg border bg-destructive/5 border-destructive/20"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{issue.title}</p>
                        <p className="text-xs text-muted-foreground">{issue.id}</p>
                        {issue.blocked_by && issue.blocked_by.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Blocked by: {issue.blocked_by.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No blocked issues
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignee Workload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assignee Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {assigneeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assigneeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No assigned issues
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      </div>
    </div>
  );
}
