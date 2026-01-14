import { Router } from 'express';
import { BeadsClient } from '../services/beads-client.js';

export const dependenciesRouter = Router();

const getSocketPath = () => {
  const cwd = process.cwd();
  const beadsDir = cwd.includes('beads-ui')
    ? cwd.replace(/\/beads-ui.*$/, '/.beads/bd.sock')
    : `${cwd}/.beads/bd.sock`;
  return beadsDir;
};

// Get dependency graph data
dependenciesRouter.get('/', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());

    // Get all issues with their dependencies
    const allIssues = await client.execute('list', { exclude_status: [] });
    const issues = Array.isArray(allIssues) ? allIssues : [];

    // Build nodes and edges for graph
    const nodes = issues.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
      type: issue.issue_type,
      assignee: issue.assignee,
    }));

    // Get dependencies for each issue
    const edges: Array<{ source: string; target: string; type: string }> = [];

    for (const issue of issues) {
      // blocked_by means this issue depends on other issues
      if (issue.blocked_by && Array.isArray(issue.blocked_by)) {
        for (const blockerId of issue.blocked_by) {
          edges.push({
            source: blockerId,
            target: issue.id,
            type: 'blocks',
          });
        }
      }
    }

    res.json({ nodes, edges });
  } catch (error) {
    console.error('Error getting dependencies:', error);
    res.status(500).json({ error: 'Failed to get dependencies' });
  }
});

// Add dependency
dependenciesRouter.post('/:fromId/depends-on/:toId', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());
    const result = await client.execute('dep_add', {
      from_id: req.params.fromId,
      to_id: req.params.toId,
      dep_type: 'blocks',
    });
    res.json(result);
  } catch (error) {
    console.error('Error adding dependency:', error);
    res.status(500).json({ error: 'Failed to add dependency' });
  }
});

// Remove dependency
dependenciesRouter.delete('/:fromId/depends-on/:toId', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());
    const result = await client.execute('dep_remove', {
      from_id: req.params.fromId,
      to_id: req.params.toId,
    });
    res.json(result);
  } catch (error) {
    console.error('Error removing dependency:', error);
    res.status(500).json({ error: 'Failed to remove dependency' });
  }
});
