/**
 * LocalStorage wrapper with error handling and quota management
 * 
 * This module provides a safe interface to localStorage with proper
 * error handling, quota checking, and data validation.
 */

import {
  STORAGE_KEYS,
  STORAGE_VERSION,
  StorageResult,
  StorageQuota,
} from './types';

/**
 * Error thrown when localStorage operations fail
 */
export class StorageError extends Error {
  constructor(message: string, public readonly code: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Checks if localStorage is available in the current environment
 * 
 * @returns true if localStorage is available, false otherwise
 */
export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    
    // Test storage by writing and reading a test value
    const testKey = '__enigma_storage_test__';
    window.localStorage.setItem(testKey, 'test');
    const retrieved = window.localStorage.getItem(testKey);
    window.localStorage.removeItem(testKey);
    
    return retrieved === 'test';
  } catch {
    return false;
  }
}

/**
 * Gets the current storage quota information
 * 
 * @returns Storage quota information
 */
export function getStorageQuota(): StorageQuota {
  if (!isLocalStorageAvailable()) {
    return {
      used: 0,
      available: 0,
      percentage: 100,
      canStore: false,
    };
  }
  
  try {
    // Estimate storage usage by stringifying all localStorage data
    let totalUsed = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalUsed += key.length + value.length;
        }
      }
    }
    
    // Convert to bytes (rough estimate, assuming UTF-16)
    const usedBytes = totalUsed * 2;
    
    // Most browsers allow ~5-10MB for localStorage
    // We'll be conservative and assume 5MB limit
    const limitBytes = 5 * 1024 * 1024;
    const availableBytes = Math.max(0, limitBytes - usedBytes);
    const percentage = Math.min(100, (usedBytes / limitBytes) * 100);
    
    return {
      used: usedBytes,
      available: availableBytes,
      percentage,
      canStore: percentage < 95, // Leave 5% buffer
    };
  } catch (error) {
    return {
      used: 0,
      available: 0,
      percentage: 100,
      canStore: false,
    };
  }
}

/**
 * Safely retrieves an item from localStorage
 * 
 * @param key - The storage key
 * @returns Storage result with the retrieved data
 */
export function getStorageItem<T>(key: string): StorageResult<T> {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available',
      };
    }
    
    const item = localStorage.getItem(key);
    if (item === null) {
      return {
        success: true,
        data: undefined,
      };
    }
    
    const parsed = JSON.parse(item);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve item',
    };
  }
}

/**
 * Safely stores an item in localStorage
 * 
 * @param key - The storage key
 * @param value - The value to store
 * @returns Storage result indicating success or failure
 */
export function setStorageItem<T>(key: string, value: T): StorageResult {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available',
      };
    }
    
    const quota = getStorageQuota();
    if (!quota.canStore) {
      return {
        success: false,
        error: 'Storage quota exceeded',
      };
    }
    
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'Storage quota exceeded',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to store item',
    };
  }
}

/**
 * Safely removes an item from localStorage
 * 
 * @param key - The storage key
 * @returns Storage result indicating success or failure
 */
export function removeStorageItem(key: string): StorageResult {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available',
      };
    }
    
    localStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove item',
    };
  }
}

/**
 * Clears all Enigma+ data from localStorage
 * 
 * @returns Storage result indicating success or failure
 */
export function clearEnigmaStorage(): StorageResult {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available',
      };
    }
    
    // Remove all Enigma+ storage keys
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear storage',
    };
  }
}

/**
 * Checks and initializes storage version compatibility
 * 
 * @returns Storage result with version information
 */
export function initializeStorage(): StorageResult<{ version: number; migrationNeeded: boolean }> {
  try {
    const versionResult = getStorageItem<number>(STORAGE_KEYS.VERSION);
    
    if (!versionResult.success) {
      return versionResult;
    }
    
    const currentVersion = versionResult.data || 0;
    const migrationNeeded = currentVersion < STORAGE_VERSION;
    
    if (migrationNeeded) {
      // Set the current version
      const setResult = setStorageItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
      if (!setResult.success) {
        return setResult;
      }
    }
    
    return {
      success: true,
      data: {
        version: currentVersion,
        migrationNeeded,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize storage',
    };
  }
}

/**
 * Estimates the storage size of an object in bytes
 * 
 * @param obj - The object to measure
 * @returns Estimated size in bytes
 */
export function estimateStorageSize(obj: unknown): number {
  try {
    const serialized = JSON.stringify(obj);
    // Rough estimate: UTF-16 encoding
    return serialized.length * 2;
  } catch {
    return 0;
  }
}

/**
 * Compresses storage by removing expired or unnecessary data
 * 
 * @returns Storage result with compression statistics
 */
export function compressStorage(): StorageResult<{ bytesFreed: number }> {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available',
      };
    }
    
    const beforeSize = getStorageQuota().used;
    
    // TODO: Implement compression logic
    // - Remove old recent configurations
    // - Clean up temporary data
    // - Optimize serialization
    
    const afterSize = getStorageQuota().used;
    const bytesFreed = Math.max(0, beforeSize - afterSize);
    
    return {
      success: true,
      data: { bytesFreed },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compress storage',
    };
  }
}
