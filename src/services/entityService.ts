import api from "./api";
import { buildApiEndpoint, extractNumericId } from "../utils/idUtils";

/**
 * Generic entity service following DRY and SOLID principles
 * Single Responsibility: Handles generic API operations for entities
 * Open/Closed: Extensible through configuration
 * Interface Segregation: Focused interface for entity operations
 * Dependency Inversion: Depends on api abstraction
 */

export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

export interface ApiResponse<T> {
  member: T[];
  totalItems: number;
  page: number;
  itemsPerPage: number;
}

export interface EntityServiceConfig {
  endpoint: string;
  relationKeys?: string[];
}

export class EntityService<T extends { id?: number; "@id"?: string }> {
  private endpoint: string;
  private relationKeys: string[];

  constructor(config: EntityServiceConfig) {
    this.endpoint = config.endpoint;
    this.relationKeys = config.relationKeys || [];
  }

  /**
   * Fetch entities with pagination
   */
  async fetchAll(params: PaginationParams = {}): Promise<ApiResponse<T>> {
    const { page = 1, itemsPerPage = 30 } = params;
    const response = await api.get(
      `${this.endpoint}?page=${page}&itemsPerPage=${itemsPerPage}`,
    );

    let items = response.data.member;

    if (this.relationKeys.length > 0) {
      items = await Promise.all(
        items.map((item: T) => this.resolveRelations(item)),
      );
    }

    return {
      member: items,
      totalItems: response.data.totalItems,
      page,
      itemsPerPage,
    };
  }

  /**
   * Fetch a single entity by ID
   */
  async fetchById(id: number | string): Promise<T> {
    const numericId = extractNumericId(id);
    if (!numericId) {
      throw new Error(`Invalid ID format for fetchById: ${id}`);
    }

    const fetchEndpoint = buildApiEndpoint(this.endpoint, numericId);
    const response = await api.get(fetchEndpoint);
    return this.resolveRelations(response.data);
  }

  /**
   * Create a new entity
   */
  async create(
    entity: Omit<T, "id" | "@id" | "@type" | "createdAt" | "updatedAt">,
  ): Promise<T> {
    const response = await api.post(this.endpoint, entity);
    return response.data;
  }

  /**
   * Update an existing entity
   */
  async update(entity: T): Promise<T> {
    const numericId = extractNumericId(entity["@id"] || entity.id);

    if (!numericId) {
      throw new Error("Entity ID is required for update operation");
    }

    const updateEndpoint = buildApiEndpoint(this.endpoint, numericId);
    const response = await api.put(updateEndpoint, entity);
    return response.data;
  }

  /**
   * Delete an entity
   */
  async delete(id: number | string): Promise<void> {
    const numericId = extractNumericId(id);
    if (!numericId) {
      throw new Error(`Invalid ID format for delete: ${id}`);
    }

    const deleteEndpoint = buildApiEndpoint(this.endpoint, numericId);
    await api.delete(deleteEndpoint);
  }

  /**
   * Search entities with query parameters
   */
  async search(
    query: Record<string, any>,
    params: PaginationParams = {},
  ): Promise<ApiResponse<T>> {
    const { page = 1, itemsPerPage = 30 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      itemsPerPage: itemsPerPage.toString(),
      ...Object.fromEntries(
        Object.entries(query).map(([key, value]) => [key, String(value)]),
      ),
    });

    const response = await api.get(`${this.endpoint}?${queryParams}`);

    let items = response.data.member;

    if (this.relationKeys.length > 0) {
      items = await Promise.all(
        items.map((item: T) => this.resolveRelations(item)),
      );
    }

    return {
      member: items,
      totalItems: response.data.totalItems,
      page,
      itemsPerPage,
    };
  }

  /**
   * Resolve related entities from URI references
   */
  private async resolveRelations(item: T): Promise<T> {
    if (this.relationKeys.length === 0) {
      return item;
    }

    const resolvedItem = { ...item } as any;

    for (const key of this.relationKeys) {
      if (
        typeof item[key as keyof T] === "string" &&
        (item[key as keyof T] as string).startsWith("/")
      ) {
        try {
          const response = await api.get(item[key as keyof T] as string);
          resolvedItem[key] = response.data;
        } catch (error) {
          resolvedItem[key] = null;
        }
      }
    }

    return resolvedItem;
  }

  /**
   * Batch operations
   */
  async createBatch(
    entities: Array<
      Omit<T, "id" | "@id" | "@type" | "createdAt" | "updatedAt">
    >,
  ): Promise<T[]> {
    const promises = entities.map((entity) => this.create(entity));
    return Promise.all(promises);
  }

  async updateBatch(entities: T[]): Promise<T[]> {
    const promises = entities.map((entity) => this.update(entity));
    return Promise.all(promises);
  }

  async deleteBatch(ids: (number | string)[]): Promise<void> {
    const promises = ids.map((id) => this.delete(id));
    await Promise.all(promises);
  }
}

/**
 * Factory function to create entity services
 */
export function createEntityService<T extends { id?: number; "@id"?: string }>(
  config: EntityServiceConfig,
): EntityService<T> {
  return new EntityService<T>(config);
}

/**
 * Predefined entity services for the CRM entities
 */
export const contactService = createEntityService({
  endpoint: "/contacts",
  relationKeys: ["company"],
});

export const companyService = createEntityService({
  endpoint: "/companies",
});

export const opportunityService = createEntityService({
  endpoint: "/opportunities",
  relationKeys: ["contact"],
});

export const taskService = createEntityService({
  endpoint: "/tasks",
  relationKeys: ["contact"],
});

export const noteService = createEntityService({
  endpoint: "/notes",
  relationKeys: ["contact"],
});
