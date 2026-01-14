import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Find the .beads directory by walking up from cwd
function findBeadsDir(startDir: string): string | null {
  let current = startDir;
  const root = '/';

  while (current !== root) {
    const beadsPath = resolve(current, '.beads', 'bd.sock');
    if (existsSync(beadsPath)) {
      return beadsPath;
    }
    current = dirname(current);
  }

  return null;
}

let cachedSocketPath: string | null = null;

export function getSocketPath(): string {
  if (cachedSocketPath) {
    return cachedSocketPath;
  }

  // Try environment variable first
  if (process.env.BEADS_SOCKET) {
    cachedSocketPath = process.env.BEADS_SOCKET;
    return cachedSocketPath;
  }

  // Try to find .beads directory by walking up from cwd
  const cwd = process.cwd();
  const found = findBeadsDir(cwd);

  if (found) {
    console.log(`Found beads socket at: ${found}`);
    cachedSocketPath = found;
    return cachedSocketPath;
  }

  // Fallback: try common locations
  const fallbacks = [
    resolve(cwd, '..', '.beads', 'bd.sock'),
    resolve(cwd, '..', '..', '.beads', 'bd.sock'),
    '/Volumes/Development/test-beads/.beads/bd.sock',
  ];

  for (const path of fallbacks) {
    if (existsSync(path)) {
      console.log(`Found beads socket at fallback: ${path}`);
      cachedSocketPath = path;
      return cachedSocketPath;
    }
  }

  // Last resort - use the hardcoded path
  cachedSocketPath = '/Volumes/Development/test-beads/.beads/bd.sock';
  console.log(`Using hardcoded socket path: ${cachedSocketPath}`);
  return cachedSocketPath;
}
