/**
 * Date utility functions for handling API date formats and HTML date inputs
 * Follows SOLID principles with single responsibility and DRY approach
 */

/**
 * Converts an ISO date string (from API) to YYYY-MM-DD format (for HTML date inputs)
 * @param isoDate - ISO date string (e.g., "2025-07-22T00:00:00+00:00")
 * @returns Date string in YYYY-MM-DD format or empty string if invalid
 */
export function isoToDateInput(isoDate?: string | null): string {
  if (!isoDate) return ''
  
  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return ''
    
    // Format to YYYY-MM-DD using local timezone
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

/**
 * Converts a date input value (YYYY-MM-DD) to ISO string for API
 * @param dateInput - Date string in YYYY-MM-DD format
 * @returns ISO date string or undefined if invalid
 */
export function dateInputToIso(dateInput?: string | null): string | undefined {
  if (!dateInput) return undefined
  
  try {
    const date = new Date(dateInput + 'T00:00:00.000Z')
    if (isNaN(date.getTime())) return undefined
    
    return date.toISOString()
  } catch {
    return undefined
  }
}

/**
 * Converts API entity dates to format suitable for editing forms
 * @param entity - Entity object with potential date fields
 * @param dateFields - Array of field names that contain dates
 * @returns New entity object with converted date fields
 */
export function convertEntityDatesForEditing<T extends Record<string, any>>(
  entity: T,
  dateFields: (keyof T)[]
): T {
  const converted = { ...entity }
  
  for (const field of dateFields) {
    if (converted[field]) {
      converted[field] = isoToDateInput(converted[field] as string) as T[keyof T]
    }
  }
  
  return converted
}

/**
 * Converts form date fields back to ISO format for API submission
 * @param entity - Entity object with date fields in YYYY-MM-DD format
 * @param dateFields - Array of field names that contain dates
 * @returns New entity object with converted date fields
 */
export function convertEntityDatesForApi<T extends Record<string, any>>(
  entity: T,
  dateFields: (keyof T)[]
): T {
  const converted = { ...entity }
  
  for (const field of dateFields) {
    if (converted[field]) {
      const isoDate = dateInputToIso(converted[field] as string)
      converted[field] = (isoDate || converted[field]) as T[keyof T]
    }
  }
  
  return converted
}