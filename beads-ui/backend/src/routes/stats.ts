import { Router } from 'express';
import { BeadsClient } from '../services/beads-client.js';

export const statsRouter = Router();

const getSocketPath = () => {
  const cwd = process.cwd();
  const beadsDir = cwd.includes('beads-ui')
    ? cwd.replace(/\/beads-ui.*$/, '/.beads/bd.sock')
    : `${cwd}/.beads/bd.sock`;
  return beadsDir;
};

// Get dashboard stats
statsRouter.get('/', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());

    // Get all issues for statistics
    const allIssues = await client.execute('list', { exclude_status: [] });
    const issues = Array.isArray(allIssues) ? allIssues : [];

    // Calculate stats
    const statusCounts = {
      open: 0,
      in_progress: 0,
      blocked: 0,
      closed: 0,
    };

    const priorityCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const typeCounts: Record<string, number> = {};
    const assigneeCounts: Record<string, number> = {};
    const closedByDate: Record<string, number> = {};

    for (const issue of issues) {
      // Status
      const status = issue.status as keyof typeof statusCounts;
      if (status in statusCounts) {
        statusCounts[status]++;
      }

      // Priority
      const priority = issue.priority as number;
      if (priority in priorityCounts) {
        priorityCounts[priority]++;
      }

      // Type
      const type = issue.issue_type || 'task';
      typeCounts[type] = (typeCounts[type] || 0) + 1;

      // Assignee workload (only count non-closed)
      if (issue.status !== 'closed' && issue.assignee) {
        assigneeCounts[issue.assignee] = (assigneeCounts[issue.assignee] || 0) + 1;
      }

      // Burndown - issues closed by date
      if (issue.status === 'closed' && issue.closed_at) {
        const date = issue.closed_at.split('T')[0];
        closedByDate[date] = (closedByDate[date] || 0) + 1;
      }
    }

    // Get blocked issues with their blockers
    const blockedIssues = await client.execute('blocked', {});
    const blocked = Array.isArray(blockedIssues) ? blockedIssues : [];

    res.json({
      statusCounts,
      priorityCounts,
      typeCounts,
      assigneeCounts,
      closedByDate,
      blockedIssues: blocked,
      totalIssues: issues.length,
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});
