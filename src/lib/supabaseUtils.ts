
/**
 * Utility functions to help with Supabase TypeScript issues
 */

/**
 * Safely cast Supabase query results to the expected type
 * This is needed because the Supabase TypeScript types are complex and don't always match our custom types
 */
export function safeCast<T>(data: any): T[] {
  if (!data || Array.isArray(data) && data.length === 0) {
    return [] as T[];
  }
  return data as T[];
}

/**
 * Cast a single row result to the expected type
 */
export function safeCastSingle<T>(data: any): T | null {
  if (!data) {
    return null;
  }
  return data as T;
}

/**
 * Type guard to check if an object has a specific property
 */
export function hasProperty<K extends string>(obj: unknown, prop: K): obj is { [key in K]: unknown } {
  return typeof obj === 'object' && obj !== null && prop in obj;
}

/**
 * Safely extract a property from a potentially error object
 */
export function safeGet<T>(data: any, defaultValue: T): T {
  if (!data || typeof data === 'object' && hasProperty(data, 'error')) {
    return defaultValue;
  }
  return data as T;
}

/**
 * Check if a value is likely a Supabase error object
 */
export function isSupabaseError(value: any): boolean {
  return typeof value === 'object' && value !== null && 'error' in value;
}

/**
 * Helper to extract data from profiles join
 */
export function extractProfileData(memberData: any): { username?: string | null; email?: string | null } {
  if (!memberData || isSupabaseError(memberData)) {
    return { username: null, email: null };
  }
  
  if (memberData.profiles) {
    return {
      username: memberData.profiles.username || null,
      email: memberData.profiles.email || null
    };
  }
  
  return { username: null, email: null };
}
