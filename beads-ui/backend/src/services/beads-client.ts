import net from 'net';

interface RPCRequest {
  operation: string;
  args: Record<string, unknown>;
  actor?: string;
}

interface RPCResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export class BeadsClient {
  private socketPath: string;

  constructor(socketPath: string) {
    this.socketPath = socketPath;
  }

  async execute(operation: string, args: Record<string, unknown> = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(this.socketPath);
      let responseData = '';

      const cleanup = () => {
        socket.removeAllListeners();
        socket.destroy();
      };

      socket.on('connect', () => {
        const request: RPCRequest = {
          operation,
          args,
          actor: 'beads-ui',
        };
        socket.write(JSON.stringify(request) + '\n');
      });

      socket.on('data', (data) => {
        responseData += data.toString();

        // Try to parse response - daemon sends newline-delimited JSON
        const lines = responseData.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const response: RPCResponse = JSON.parse(line);
            cleanup();

            if (response.success) {
              resolve(response.data);
            } else {
              reject(new Error(response.error || 'RPC request failed'));
            }
            return;
          } catch {
            // Not complete JSON yet, keep reading
          }
        }
      });

      socket.on('end', () => {
        cleanup();
        reject(new Error('Connection closed before response received'));
      });

      socket.on('error', (error) => {
        cleanup();
        reject(new Error(`Socket error: ${error.message}`));
      });

      // Timeout after 10 seconds
      socket.setTimeout(10000, () => {
        cleanup();
        reject(new Error('RPC request timed out'));
      });
    });
  }

  async list(filters: Record<string, unknown> = {}): Promise<unknown[]> {
    const result = await this.execute('list', filters);
    return Array.isArray(result) ? result : [];
  }

  async show(id: string): Promise<unknown> {
    return this.execute('show', { id });
  }

  async create(args: {
    title: string;
    description?: string;
    issue_type?: string;
    priority?: number;
    assignee?: string;
    labels?: string[];
  }): Promise<unknown> {
    return this.execute('create', {
      title: args.title,
      description: args.description || '',
      issue_type: args.issue_type || 'task',
      priority: args.priority ?? 2,
      assignee: args.assignee,
      labels: args.labels,
    });
  }

  async update(
    id: string,
    updates: {
      title?: string;
      description?: string;
      status?: string;
      priority?: number;
      assignee?: string;
      issue_type?: string;
    }
  ): Promise<unknown> {
    return this.execute('update', { id, ...updates });
  }

  async close(id: string, reason?: string): Promise<unknown> {
    return this.execute('close', { id, reason });
  }

  async delete(ids: string[]): Promise<unknown> {
    return this.execute('delete', { ids });
  }

  async addDependency(fromId: string, toId: string): Promise<unknown> {
    return this.execute('dep_add', {
      from_id: fromId,
      to_id: toId,
      dep_type: 'blocks',
    });
  }

  async removeDependency(fromId: string, toId: string): Promise<unknown> {
    return this.execute('dep_remove', {
      from_id: fromId,
      to_id: toId,
    });
  }

  async addLabel(id: string, label: string): Promise<unknown> {
    return this.execute('label_add', { id, label });
  }

  async removeLabel(id: string, label: string): Promise<unknown> {
    return this.execute('label_remove', { id, label });
  }

  async getBlocked(): Promise<unknown[]> {
    const result = await this.execute('blocked', {});
    return Array.isArray(result) ? result : [];
  }

  async getStats(): Promise<unknown> {
    return this.execute('stats', {});
  }
}
