import express from 'express';
import cors from 'cors';
import { issuesRouter } from './routes/issues.js';
import { statsRouter } from './routes/stats.js';
import { dependenciesRouter } from './routes/dependencies.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/issues', issuesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/dependencies', dependenciesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
