/**
 * Type definitions for local storage operations
 * 
 * This module defines the data structures used for persisting
 * rotor configurations and application state in localStorage.
 */

import { RotorConfig, RotorId } from '../rotors/types';

/**
 * Storage version for data migration compatibility
 */
export const STORAGE_VERSION = 1;

/**
 * Storage keys used in localStorage
 */
export const STORAGE_KEYS = {
  ROTORS: 'enigma_rotors',
  APP_SETTINGS: 'enigma_settings',
  VERSION: 'enigma_version',
} as const;

/**
 * Serializable rotor configuration for storage
 * (converts Date objects to ISO strings)
 */
export interface StoredRotorConfig {
  readonly id: RotorId;
  readonly name: string;
  readonly description?: string;
  readonly permutation: readonly number[];
  readonly createdAt: string; // ISO date string
  readonly updatedAt: string; // ISO date string
}

/**
 * Complete rotor storage data structure
 */
export interface RotorStorageData {
  readonly version: number;
  readonly rotors: Record<RotorId, StoredRotorConfig>;
  readonly metadata: {
    readonly totalRotors: number;
    readonly lastModified: string; // ISO date string
  };
}

/**
 * Application settings that persist across sessions
 */
export interface AppSettings {
  readonly version: number;
  readonly preferences: {
    readonly defaultRotorCount: number;
    readonly autoSaveEnabled: boolean;
    readonly showAdvancedOptions: boolean;
  };
  readonly recentConfigurations: readonly RecentConfiguration[];
}

/**
 * Recently used rotor configuration
 */
export interface RecentConfiguration {
  readonly id: string;
  readonly name: string;
  readonly rotorIds: readonly RotorId[];
  readonly startPositions: readonly number[];
  readonly lastUsed: string; // ISO date string
}

/**
 * Storage operation result
 */
export interface StorageResult<T = void> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

/**
 * Storage quota information
 */
export interface StorageQuota {
  readonly used: number; // bytes used
  readonly available: number; // bytes available
  readonly percentage: number; // percentage used (0-100)
  readonly canStore: boolean; // whether more data can be stored
}

/**
 * Export/import data format
 */
export interface ExportData {
  readonly version: number;
  readonly exportDate: string; // ISO date string
  readonly rotors: StoredRotorConfig[];
  readonly metadata: {
    readonly source: 'enigma-plus';
    readonly description: string;
  };
}

/**
 * Import validation result
 */
export interface ImportValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly rotorCount: number;
  readonly compatibleVersion: boolean;
}
