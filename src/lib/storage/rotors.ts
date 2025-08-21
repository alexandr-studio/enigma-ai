/**
 * Rotor storage operations
 * 
 * This module handles the persistence of rotor configurations,
 * including CRUD operations, export/import, and validation.
 */

import { RotorConfig, RotorId, MAX_STORED_ROTORS } from '../rotors/types';
import { validateRotorConfig } from '../rotors/validation';
import {
  STORAGE_KEYS,
  STORAGE_VERSION,
  StoredRotorConfig,
  RotorStorageData,
  ExportData,
  ImportValidationResult,
  StorageResult,
} from './types';
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  isLocalStorageAvailable,
  getStorageQuota,
  estimateStorageSize,
} from './localStorage';

/**
 * Converts a RotorConfig to StoredRotorConfig for serialization
 */
function rotorConfigToStored(config: RotorConfig): StoredRotorConfig {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    permutation: config.permutation,
    createdAt: config.createdAt.toISOString(),
    updatedAt: config.updatedAt.toISOString(),
  };
}

/**
 * Converts a StoredRotorConfig back to RotorConfig
 */
function storedToRotorConfig(stored: StoredRotorConfig): RotorConfig {
  return {
    id: stored.id,
    name: stored.name,
    description: stored.description,
    permutation: stored.permutation,
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt),
  };
}

/**
 * Loads all rotor configurations from storage
 * 
 * @returns Storage result with map of rotor ID to configuration
 */
export function loadRotors(): StorageResult<Map<RotorId, RotorConfig>> {
  try {
    const result = getStorageItem<RotorStorageData>(STORAGE_KEYS.ROTORS);
    
    if (!result.success) {
      return result;
    }
    
    if (!result.data) {
      // No rotors stored yet, return empty map
      return {
        success: true,
        data: new Map(),
      };
    }
    
    const rotorMap = new Map<RotorId, RotorConfig>();
    
    // Convert stored rotors back to RotorConfig objects
    for (const [id, storedRotor] of Object.entries(result.data.rotors)) {
      try {
        const rotorConfig = storedToRotorConfig(storedRotor);
        validateRotorConfig(rotorConfig);
        rotorMap.set(id, rotorConfig);
      } catch (error) {
        console.warn(`Failed to load rotor ${id}:`, error);
        // Continue loading other rotors
      }
    }
    
    return {
      success: true,
      data: rotorMap,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load rotors',
    };
  }
}

/**
 * Saves all rotor configurations to storage
 * 
 * @param rotors - Map of rotor configurations to save
 * @returns Storage result indicating success or failure
 */
export function saveRotors(rotors: Map<RotorId, RotorConfig>): StorageResult {
  try {
    if (rotors.size > MAX_STORED_ROTORS) {
      return {
        success: false,
        error: `Cannot store more than ${MAX_STORED_ROTORS} rotors`,
      };
    }
    
    // Check storage quota before saving
    const quota = getStorageQuota();
    if (!quota.canStore) {
      return {
        success: false,
        error: 'Storage quota exceeded',
      };
    }
    
    // Convert to storage format
    const storedRotors: Record<RotorId, StoredRotorConfig> = {};
    for (const [id, config] of rotors) {
      storedRotors[id] = rotorConfigToStored(config);
    }
    
    const storageData: RotorStorageData = {
      version: STORAGE_VERSION,
      rotors: storedRotors,
      metadata: {
        totalRotors: rotors.size,
        lastModified: new Date().toISOString(),
      },
    };
    
    // Estimate size before storing
    const estimatedSize = estimateStorageSize(storageData);
    if (estimatedSize > quota.available) {
      return {
        success: false,
        error: 'Not enough storage space available',
      };
    }
    
    return setStorageItem(STORAGE_KEYS.ROTORS, storageData);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save rotors',
    };
  }
}

/**
 * Adds a new rotor configuration
 * 
 * @param config - The rotor configuration to add
 * @returns Storage result indicating success or failure
 */
export function addRotor(config: RotorConfig): StorageResult {
  try {
    validateRotorConfig(config);
    
    const loadResult = loadRotors();
    if (!loadResult.success) {
      return loadResult;
    }
    
    const rotors = loadResult.data!;
    
    if (rotors.has(config.id)) {
      return {
        success: false,
        error: `Rotor with ID '${config.id}' already exists`,
      };
    }
    
    if (rotors.size >= MAX_STORED_ROTORS) {
      return {
        success: false,
        error: `Cannot store more than ${MAX_STORED_ROTORS} rotors`,
      };
    }
    
    rotors.set(config.id, config);
    return saveRotors(rotors);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add rotor',
    };
  }
}

/**
 * Updates an existing rotor configuration
 * 
 * @param config - The updated rotor configuration
 * @returns Storage result indicating success or failure
 */
export function updateRotor(config: RotorConfig): StorageResult {
  try {
    validateRotorConfig(config);
    
    const loadResult = loadRotors();
    if (!loadResult.success) {
      return loadResult;
    }
    
    const rotors = loadResult.data!;
    
    if (!rotors.has(config.id)) {
      return {
        success: false,
        error: `Rotor with ID '${config.id}' does not exist`,
      };
    }
    
    rotors.set(config.id, config);
    return saveRotors(rotors);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update rotor',
    };
  }
}

/**
 * Removes a rotor configuration
 * 
 * @param rotorId - The ID of the rotor to remove
 * @returns Storage result indicating success or failure
 */
export function removeRotor(rotorId: RotorId): StorageResult {
  try {
    const loadResult = loadRotors();
    if (!loadResult.success) {
      return loadResult;
    }
    
    const rotors = loadResult.data!;
    
    if (!rotors.has(rotorId)) {
      return {
        success: false,
        error: `Rotor with ID '${rotorId}' does not exist`,
      };
    }
    
    rotors.delete(rotorId);
    return saveRotors(rotors);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove rotor',
    };
  }
}

/**
 * Gets a single rotor configuration by ID
 * 
 * @param rotorId - The ID of the rotor to retrieve
 * @returns Storage result with the rotor configuration
 */
export function getRotor(rotorId: RotorId): StorageResult<RotorConfig> {
  try {
    const loadResult = loadRotors();
    if (!loadResult.success) {
      return loadResult;
    }
    
    const rotors = loadResult.data!;
    const rotor = rotors.get(rotorId);
    
    if (!rotor) {
      return {
        success: false,
        error: `Rotor with ID '${rotorId}' not found`,
      };
    }
    
    return {
      success: true,
      data: rotor,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get rotor',
    };
  }
}

/**
 * Exports rotor configurations to a portable format
 * 
 * @param rotorIds - Optional array of specific rotor IDs to export (exports all if not provided)
 * @returns Storage result with export data
 */
export function exportRotors(rotorIds?: RotorId[]): StorageResult<ExportData> {
  try {
    const loadResult = loadRotors();
    if (!loadResult.success) {
      return loadResult;
    }
    
    const allRotors = loadResult.data!;
    const rotorsToExport: StoredRotorConfig[] = [];
    
    if (rotorIds) {
      // Export specific rotors
      for (const id of rotorIds) {
        const rotor = allRotors.get(id);
        if (rotor) {
          rotorsToExport.push(rotorConfigToStored(rotor));
        }
      }
    } else {
      // Export all rotors
      for (const rotor of allRotors.values()) {
        rotorsToExport.push(rotorConfigToStored(rotor));
      }
    }
    
    const exportData: ExportData = {
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      rotors: rotorsToExport,
      metadata: {
        source: 'enigma-plus',
        description: `Exported ${rotorsToExport.length} rotor configuration(s)`,
      },
    };
    
    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export rotors',
    };
  }
}

/**
 * Validates import data before importing
 * 
 * @param importData - The data to validate
 * @returns Validation result with errors and warnings
 */
export function validateImportData(importData: unknown): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    if (!importData || typeof importData !== 'object') {
      errors.push('Import data must be a valid object');
      return { valid: false, errors, warnings, rotorCount: 0, compatibleVersion: false };
    }
    
    const data = importData as any;
    
    // Check required fields
    if (typeof data.version !== 'number') {
      errors.push('Missing or invalid version number');
    }
    
    if (!Array.isArray(data.rotors)) {
      errors.push('Missing or invalid rotors array');
    }
    
    if (!data.metadata || typeof data.metadata !== 'object') {
      warnings.push('Missing metadata');
    }
    
    // Version compatibility
    const compatibleVersion = data.version <= STORAGE_VERSION;
    if (!compatibleVersion) {
      warnings.push(`Import data is from a newer version (${data.version}), some features may not be supported`);
    }
    
    let validRotorCount = 0;
    
    if (Array.isArray(data.rotors)) {
      for (let i = 0; i < data.rotors.length; i++) {
        const rotor = data.rotors[i];
        try {
          if (!rotor.id || typeof rotor.id !== 'string') {
            errors.push(`Rotor ${i}: Missing or invalid ID`);
            continue;
          }
          
          if (!rotor.name || typeof rotor.name !== 'string') {
            errors.push(`Rotor ${i}: Missing or invalid name`);
            continue;
          }
          
          if (!Array.isArray(rotor.permutation) || rotor.permutation.length !== 64) {
            errors.push(`Rotor ${i}: Invalid permutation array`);
            continue;
          }
          
          // Convert to RotorConfig and validate
          const rotorConfig = storedToRotorConfig(rotor);
          validateRotorConfig(rotorConfig);
          validRotorCount++;
        } catch (error) {
          errors.push(`Rotor ${i}: ${error instanceof Error ? error.message : 'Validation failed'}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      rotorCount: validRotorCount,
      compatibleVersion,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Validation failed'],
      warnings,
      rotorCount: 0,
      compatibleVersion: false,
    };
  }
}

/**
 * Imports rotor configurations from export data
 * 
 * @param importData - The export data to import
 * @param overwriteExisting - Whether to overwrite existing rotors with same IDs
 * @returns Storage result with import statistics
 */
export function importRotors(
  importData: ExportData,
  overwriteExisting = false
): StorageResult<{ imported: number; skipped: number; errors: string[] }> {
  try {
    const validation = validateImportData(importData);
    if (!validation.valid) {
      return {
        success: false,
        error: `Import validation failed: ${validation.errors.join(', ')}`,
      };
    }
    
    const loadResult = loadRotors();
    if (!loadResult.success) {
      return loadResult;
    }
    
    const existingRotors = loadResult.data!;
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    for (const storedRotor of importData.rotors) {
      try {
        const rotorConfig = storedToRotorConfig(storedRotor);
        
        if (existingRotors.has(rotorConfig.id)) {
          if (overwriteExisting) {
            existingRotors.set(rotorConfig.id, rotorConfig);
            imported++;
          } else {
            skipped++;
          }
        } else {
          if (existingRotors.size >= MAX_STORED_ROTORS) {
            errors.push(`Cannot import rotor '${rotorConfig.name}': storage limit reached`);
            continue;
          }
          
          existingRotors.set(rotorConfig.id, rotorConfig);
          imported++;
        }
      } catch (error) {
        errors.push(`Failed to import rotor '${storedRotor.name}': ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    if (imported > 0) {
      const saveResult = saveRotors(existingRotors);
      if (!saveResult.success) {
        return saveResult;
      }
    }
    
    return {
      success: true,
      data: { imported, skipped, errors },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import rotors',
    };
  }
}

/**
 * Clears all stored rotor configurations
 * 
 * @returns Storage result indicating success or failure
 */
export function clearAllRotors(): StorageResult {
  try {
    return removeStorageItem(STORAGE_KEYS.ROTORS);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear rotors',
    };
  }
}
