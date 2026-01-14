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
      });

      socket.on('end', () => {
        try {
          // Response might have multiple JSON objects, take the last complete one
          const lines = responseData.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const response: RPCResponse = JSON.parse(lastLine);

          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error || 'RPC request failed'));
          }
        } catch (error) {
          reject(new Error(`Failed to parse RPC response: ${responseData}`));
        }
      });

      socket.on('error', (error) => {
        reject(new Error(`Socket error: ${error.message}`));
      });

      // Timeout after 30 seconds
      socket.setTimeout(30000, () => {
        socket.destroy();
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
