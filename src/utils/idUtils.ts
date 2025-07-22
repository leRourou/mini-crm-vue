/**
 * Utility functions for handling ID conversions between API Platform IRIs and numeric IDs
 */

/**
 * Extracts numeric ID from either a numeric ID or an API Platform IRI
 * @param id - The ID to extract from (number, string numeric ID, or IRI like "/api/contacts/123")
 * @returns The numeric ID or undefined if not extractable
 */
export function extractNumericId(
    id: number | string | undefined | null,
): number | undefined {
    if (id === null || id === undefined) {
        return undefined;
    }

    if (typeof id === "number") {
        return id > 0 ? id : undefined;
    }

    if (typeof id === "string") {
        // Check if it's an IRI (starts with /)
        if (id.startsWith("/")) {
            const iriMatch = id.match(/\/(\d+)$/);
            if (iriMatch && iriMatch[1]) {
                const numericId = parseInt(iriMatch[1], 10);
                return numericId > 0 ? numericId : undefined;
            }
        } else {
            // Try to parse as numeric string
            const numericId = parseInt(id, 10);
            return !isNaN(numericId) && numericId > 0 ? numericId : undefined;
        }
    }

    return undefined;
}

/**
 * Gets the best identifier for an entity (prefers @id, falls back to id)
 * @param entity - The entity object
 * @returns The identifier string or number
 */
export function getEntityIdentifier(
    entity: { id?: number | string; "@id"?: string },
): string | number | undefined {
    return entity["@id"] || entity.id;
}

/**
 * Constructs an API endpoint URL using numeric ID extraction
 * @param baseEndpoint - The base endpoint (e.g., "/contacts")
 * @param id - The ID to use (IRI or numeric)
 * @returns The properly constructed endpoint URL
 */
export function buildApiEndpoint(
    baseEndpoint: string,
    id: number | string,
): string {
    const numericId = extractNumericId(id);
    if (!numericId) {
        throw new Error(`Invalid ID provided for endpoint construction: ${id}`);
    }
    return `${baseEndpoint}/${numericId}`;
}

/**
 * Compares two entity IDs for equality, handling both IRI and numeric formats
 * @param id1 - First ID to compare
 * @param id2 - Second ID to compare
 * @returns True if the IDs represent the same entity
 */
export function areIdsEqual(
    id1: number | string | undefined,
    id2: number | string | undefined,
): boolean {
    if (id1 === id2) return true;

    const numeric1 = extractNumericId(id1);
    const numeric2 = extractNumericId(id2);

    return numeric1 !== undefined && numeric2 !== undefined &&
        numeric1 === numeric2;
}
