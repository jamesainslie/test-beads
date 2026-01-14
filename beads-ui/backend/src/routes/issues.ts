import { Router } from 'express';
import { BeadsClient } from '../services/beads-client.js';

export const issuesRouter = Router();

const getSocketPath = () => {
  const cwd = process.cwd();
  // Navigate up to find .beads directory
  const beadsDir = cwd.includes('beads-ui')
    ? cwd.replace(/\/beads-ui.*$/, '/.beads/bd.sock')
    : `${cwd}/.beads/bd.sock`;
  return beadsDir;
};

// List issues
issuesRouter.get('/', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());
    const { status, type, priority, assignee, search } = req.query;

    const args: Record<string, unknown> = {};
    if (status) args.status = status;
    if (type) args.issue_type = type;
    if (priority) args.priority = parseInt(priority as string);
    if (assignee) args.assignee = assignee;
    if (search) args.title_contains = search;

    const result = await client.execute('list', args);
    res.json(result);
  } catch (error) {
    console.error('Error listing issues:', error);
    res.status(500).json({ error: 'Failed to list issues' });
  }
});

// Get single issue
issuesRouter.get('/:id', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());
    const result = await client.execute('show', { id: req.params.id });
    res.json(result);
  } catch (error) {
    console.error('Error getting issue:', error);
    res.status(500).json({ error: 'Failed to get issue' });
  }
});

// Create issue
issuesRouter.post('/', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());
    const result = await client.execute('create', req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// Update issue
issuesRouter.patch('/:id', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());
    const result = await client.execute('update', { id: req.params.id, ...req.body });
    res.json(result);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

// Close issue
issuesRouter.post('/:id/close', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());
    const result = await client.execute('close', { id: req.params.id, ...req.body });
    res.json(result);
  } catch (error) {
    console.error('Error closing issue:', error);
    res.status(500).json({ error: 'Failed to close issue' });
  }
});

// Delete issue
issuesRouter.delete('/:id', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());
    const result = await client.execute('delete', { ids: [req.params.id] });
    res.json(result);
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ error: 'Failed to delete issue' });
  }
});

// Add label
issuesRouter.post('/:id/labels', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());
    const result = await client.execute('label_add', { id: req.params.id, label: req.body.label });
    res.json(result);
  } catch (error) {
    console.error('Error adding label:', error);
    res.status(500).json({ error: 'Failed to add label' });
  }
});

// Remove label
issuesRouter.delete('/:id/labels/:label', async (req, res) => {
  try {
    const client = new BeadsClient(getSocketPath());
    const result = await client.execute('label_remove', { id: req.params.id, label: req.params.label });
    res.json(result);
  } catch (error) {
    console.error('Error removing label:', error);
    res.status(500).json({ error: 'Failed to remove label' });
  }
});
