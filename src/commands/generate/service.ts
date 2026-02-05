/**
 * Service Generator
 *
 * Generates API service with TypeScript types
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../../types/index.js';

export interface ServiceOptions {
  name: string;
  path?: string;
  test?: boolean;
  typescript?: boolean;
}

/**
 * Generate an API service
 */
export async function generateService(
  options: ServiceOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const { name, path: customPath, test: includeTest = true, typescript = true } = options;

  ctx.logger.step(`Generating service: ${name}`);

  // Validate service name
  if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
    return {
      message: 'Service name must be camelCase (e.g., userService, authService)',
      status: 'error',
    };
  }

  // Determine output path
  const servicesDir = customPath ? join(ctx.cwd, customPath) : join(ctx.cwd, 'src', 'services');

  // Create services directory if it doesn't exist
  if (!existsSync(servicesDir)) {
    mkdirSync(servicesDir, { recursive: true });
  }

  const ext = typescript ? 'ts' : 'js';
  const files: string[] = [];

  try {
    // Generate service file
    const serviceFile = join(servicesDir, `${name}.${ext}`);

    // Check if service already exists
    if (existsSync(serviceFile)) {
      return {
        message: `Service already exists: ${serviceFile}`,
        status: 'error',
      };
    }

    const serviceContent = generateServiceContent(name, { typescript });
    writeFileSync(serviceFile, serviceContent, 'utf-8');
    files.push(serviceFile);
    ctx.logger.success(`Created ${name}.${ext}`);

    // Generate types file if TypeScript
    if (typescript) {
      const typesFile = join(servicesDir, `${name}.types.ts`);
      const typesContent = generateTypesContent(name);
      writeFileSync(typesFile, typesContent, 'utf-8');
      files.push(typesFile);
      ctx.logger.success(`Created ${name}.types.ts`);
    }

    // Generate test file
    if (includeTest) {
      const testFile = join(servicesDir, `${name}.test.${ext}`);
      const testContent = generateServiceTestContent(name, { typescript });
      writeFileSync(testFile, testContent, 'utf-8');
      files.push(testFile);
      ctx.logger.success(`Created ${name}.test.${ext}`);
    }

    return {
      data: {
        files,
        servicesDir,
      },
      message: `Service ${name} generated successfully`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to generate service: ${(error as Error).message}`,
      status: 'error',
    };
  }
}

/**
 * Generate service content
 */
function generateServiceContent(name: string, options: { typescript: boolean }): string {
  const { typescript } = options;
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  return `${typescript ? `import type { ${capitalizedName}Response, ${capitalizedName}Request, ${capitalizedName}Error } from './${name}.types';\n` : ''}
/**
 * ${capitalizedName} Service
 * 
 * API service for ${name} operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ${capitalizedName}Service {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all items
   */
  async getAll()${typescript ? `: Promise<${capitalizedName}Response[]>` : ''} {
    const response = await fetch(\`\${this.baseUrl}/${name}\`);
    
    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Get item by ID
   */
  async getById(id: string)${typescript ? `: Promise<${capitalizedName}Response>` : ''} {
    const response = await fetch(\`\${this.baseUrl}/${name}/\${id}\`);
    
    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Create new item
   */
  async create(data${typescript ? `: ${capitalizedName}Request` : ''})${typescript ? `: Promise<${capitalizedName}Response>` : ''} {
    const response = await fetch(\`\${this.baseUrl}/${name}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Update item
   */
  async update(id: string, data${typescript ? `: Partial<${capitalizedName}Request>` : ''})${typescript ? `: Promise<${capitalizedName}Response>` : ''} {
    const response = await fetch(\`\${this.baseUrl}/${name}/\${id}\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Delete item
   */
  async delete(id: string)${typescript ? ': Promise<void>' : ''} {
    const response = await fetch(\`\${this.baseUrl}/${name}/\${id}\`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response)${typescript ? `: Promise<${capitalizedName}Error>` : ''} {
    const error${typescript ? `: ${capitalizedName}Error` : ''} = {
      status: response.status,
      message: response.statusText,
      details: await response.json().catch(() => ({})),
    };

    return error;
  }
}

// Export singleton instance
export const ${name} = new ${capitalizedName}Service();

// Export class for testing
export { ${capitalizedName}Service };
`;
}

/**
 * Generate types content
 */
function generateTypesContent(name: string): string {
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  return `/**
 * ${capitalizedName} Types
 */

export interface ${capitalizedName}Response {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Add your response properties here
  name: string;
  description?: string;
}

export interface ${capitalizedName}Request {
  // Add your request properties here
  name: string;
  description?: string;
}

export interface ${capitalizedName}Error {
  status: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface ${capitalizedName}ListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
`;
}

/**
 * Generate service test content
 */
function generateServiceTestContent(name: string, _options: { typescript: boolean }): string {
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  return `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ${capitalizedName}Service } from './${name}';

// Mock fetch
global.fetch = vi.fn();

describe('${capitalizedName}Service', () => {
  let service: ${capitalizedName}Service;

  beforeEach(() => {
    service = new ${capitalizedName}Service('http://test-api.com');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all items', async () => {
      const mockData = [
        { id: '1', name: 'Item 1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', name: 'Item 2', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await service.getAll();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('http://test-api.com/${name}');
    });

    it('should handle errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      });

      await expect(service.getAll()).rejects.toMatchObject({
        status: 500,
        message: 'Internal Server Error',
      });
    });
  });

  describe('getById', () => {
    it('should fetch item by id', async () => {
      const mockData = { id: '1', name: 'Item 1', createdAt: '2024-01-01', updatedAt: '2024-01-01' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await service.getById('1');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('http://test-api.com/${name}/1');
    });
  });

  describe('create', () => {
    it('should create new item', async () => {
      const newItem = { name: 'New Item', description: 'Description' };
      const mockResponse = { id: '3', ...newItem, createdAt: '2024-01-03', updatedAt: '2024-01-03' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.create(newItem);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/${name}',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        })
      );
    });
  });

  describe('update', () => {
    it('should update item', async () => {
      const updates = { name: 'Updated Item' };
      const mockResponse = { id: '1', ...updates, createdAt: '2024-01-01', updatedAt: '2024-01-04' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.update('1', updates);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete item', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      await service.delete('1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/${name}/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
`;
}
