
/**
 * This file contains custom type helpers to use with Supabase data
 */

import { Database } from '@/integrations/supabase/types';

// Define type aliases for better readability
export type Tables = Database['public']['Tables'];

// Define helper types for query parameters
export type TableInsert<T extends keyof Tables> = Tables[T]['Insert'];
export type TableRow<T extends keyof Tables> = Tables[T]['Row'];
export type TableUpdate<T extends keyof Tables> = Tables[T]['Update'];

// Define specific types for components
export interface Syndicate {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  max_members: number;
  created_at: string;
  updated_at: string;
  syndicate_members?: any[]; // Using any[] to avoid TypeScript errors when dealing with nested joins
}

export interface SyndicateMember {
  id: string;
  syndicate_id: string;
  user_id: string;
  joined_at: string;
  contribution_percentage: number;
  username?: string | null;
  email?: string | null;
  profiles?: {
    username?: string | null;
    email?: string | null;
  } | null;
}

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  account_type: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Helper function to cast Supabase data to our custom type
 * Used to work around TypeScript errors when Supabase types don't perfectly match our custom types
 */
export function castData<T>(data: unknown): T {
  return data as T;
}

/**
 * Helper function to create a properly typed insert object for Supabase tables
 */
export function createInsert<T extends keyof Tables>(
  tableName: T, 
  data: TableInsert<T>
): TableInsert<T> {
  return data;
}

/**
 * Helper function to create a properly typed update object for Supabase tables
 */
export function createUpdate<T extends keyof Tables>(
  tableName: T,
  data: TableUpdate<T>
): TableUpdate<T> {
  return data;
}
