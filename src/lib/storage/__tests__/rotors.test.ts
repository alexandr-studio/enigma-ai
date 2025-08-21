/**
 * Unit tests for rotor storage operations
 */

import {
  loadRotors,
  saveRotors,
  addRotor,
  updateRotor,
  removeRotor,
  getRotor,
  exportRotors,
  validateImportData,
  importRotors,
  clearAllRotors,
} from '../rotors';
import { createTestRotor, createRandomRotor } from '../../rotors/generator';
import { STORAGE_KEYS } from '../types';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('loadRotors', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should return empty map when no rotors are stored', () => {
    const result = loadRotors();
    
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Map);
    expect(result.data!.size).toBe(0);
  });

  it('should load stored rotors correctly', () => {
    const rotor1 = createTestRotor('Test Rotor 1');
    const rotor2 = createTestRotor('Test Rotor 2');
    const rotors = new Map([[rotor1.id, rotor1], [rotor2.id, rotor2]]);
    
    // Save rotors first
    saveRotors(rotors);
    
    // Then load them
    const result = loadRotors();
    
    expect(result.success).toBe(true);
    expect(result.data!.size).toBe(2);
    expect(result.data!.has(rotor1.id)).toBe(true);
    expect(result.data!.has(rotor2.id)).toBe(true);
  });

  it('should handle corrupted storage gracefully', () => {
    mockLocalStorage.setItem(STORAGE_KEYS.ROTORS, 'invalid-json');
    
    const result = loadRotors();
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('saveRotors', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should save rotors successfully', () => {
    const rotor = createTestRotor();
    const rotors = new Map([[rotor.id, rotor]]);
    
    const result = saveRotors(rotors);
    
    expect(result.success).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ROTORS,
      expect.any(String)
    );
  });

  it('should reject saving too many rotors', () => {
    const rotors = new Map();
    for (let i = 0; i < 15; i++) { // More than MAX_STORED_ROTORS (10)
      const rotor = createTestRotor(`Rotor ${i}`);
      rotors.set(rotor.id, rotor);
    }
    
    const result = saveRotors(rotors);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Cannot store more than');
  });
});

describe('addRotor', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should add a new rotor successfully', () => {
    const rotor = createTestRotor();
    
    const result = addRotor(rotor);
    
    expect(result.success).toBe(true);
    
    // Verify it was stored
    const loadResult = loadRotors();
    expect(loadResult.data!.has(rotor.id)).toBe(true);
  });

  it('should reject duplicate rotor IDs', () => {
    const rotor = createTestRotor();
    
    // Add rotor first time
    addRotor(rotor);
    
    // Try to add same rotor again
    const result = addRotor(rotor);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('should reject invalid rotor configurations', () => {
    const invalidRotor = {
      ...createTestRotor(),
      permutation: [1, 2, 3], // Invalid permutation
    };
    
    const result = addRotor(invalidRotor as any);
    
    expect(result.success).toBe(false);
  });
});

describe('updateRotor', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should update an existing rotor successfully', () => {
    const rotor = createTestRotor();
    addRotor(rotor);
    
    const updatedRotor = {
      ...rotor,
      name: 'Updated Name',
      updatedAt: new Date(),
    };
    
    const result = updateRotor(updatedRotor);
    
    expect(result.success).toBe(true);
    
    // Verify the update
    const getResult = getRotor(rotor.id);
    expect(getResult.data!.name).toBe('Updated Name');
  });

  it('should reject updating non-existent rotor', () => {
    const rotor = createTestRotor();
    
    const result = updateRotor(rotor);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('does not exist');
  });
});

describe('removeRotor', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should remove an existing rotor successfully', () => {
    const rotor = createTestRotor();
    addRotor(rotor);
    
    const result = removeRotor(rotor.id);
    
    expect(result.success).toBe(true);
    
    // Verify it was removed
    const getResult = getRotor(rotor.id);
    expect(getResult.success).toBe(false);
  });

  it('should handle removing non-existent rotor', () => {
    const result = removeRotor('non-existent-id');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('does not exist');
  });
});

describe('getRotor', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should retrieve existing rotor successfully', () => {
    const rotor = createTestRotor();
    addRotor(rotor);
    
    const result = getRotor(rotor.id);
    
    expect(result.success).toBe(true);
    expect(result.data!.id).toBe(rotor.id);
    expect(result.data!.name).toBe(rotor.name);
  });

  it('should handle non-existent rotor', () => {
    const result = getRotor('non-existent-id');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});

describe('exportRotors', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should export all rotors when no IDs specified', () => {
    const rotor1 = createTestRotor('Rotor 1');
    const rotor2 = createTestRotor('Rotor 2');
    addRotor(rotor1);
    addRotor(rotor2);
    
    const result = exportRotors();
    
    expect(result.success).toBe(true);
    expect(result.data!.rotors).toHaveLength(2);
    expect(result.data!.version).toBeDefined();
    expect(result.data!.exportDate).toBeDefined();
  });

  it('should export specific rotors when IDs provided', () => {
    const rotor1 = createTestRotor('Rotor 1');
    const rotor2 = createTestRotor('Rotor 2');
    addRotor(rotor1);
    addRotor(rotor2);
    
    const result = exportRotors([rotor1.id]);
    
    expect(result.success).toBe(true);
    expect(result.data!.rotors).toHaveLength(1);
    expect(result.data!.rotors[0].id).toBe(rotor1.id);
  });

  it('should handle empty rotor storage', () => {
    const result = exportRotors();
    
    expect(result.success).toBe(true);
    expect(result.data!.rotors).toHaveLength(0);
  });
});

describe('validateImportData', () => {
  it('should validate correct import data', () => {
    const validData = {
      version: 1,
      exportDate: new Date().toISOString(),
      rotors: [createTestRotor()],
      metadata: { source: 'enigma-plus', description: 'Test export' },
    };
    
    const result = validateImportData(validData);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.rotorCount).toBe(1);
  });

  it('should reject invalid import data', () => {
    const invalidData = {
      // Missing required fields
      rotors: 'not-an-array',
    };
    
    const result = validateImportData(invalidData);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should handle null or undefined data', () => {
    const result1 = validateImportData(null);
    const result2 = validateImportData(undefined);
    
    expect(result1.valid).toBe(false);
    expect(result2.valid).toBe(false);
  });
});

describe('importRotors', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should import valid rotors successfully', () => {
    const rotor = createTestRotor();
    const importData = {
      version: 1,
      exportDate: new Date().toISOString(),
      rotors: [rotor],
      metadata: { source: 'enigma-plus', description: 'Test import' },
    };
    
    const result = importRotors(importData);
    
    expect(result.success).toBe(true);
    expect(result.data!.imported).toBe(1);
    expect(result.data!.skipped).toBe(0);
    
    // Verify rotor was imported
    const getResult = getRotor(rotor.id);
    expect(getResult.success).toBe(true);
  });

  it('should handle duplicate rotors correctly', () => {
    const rotor = createTestRotor();
    addRotor(rotor); // Add rotor first
    
    const importData = {
      version: 1,
      exportDate: new Date().toISOString(),
      rotors: [rotor],
      metadata: { source: 'enigma-plus', description: 'Test import' },
    };
    
    // Import without overwrite
    const result1 = importRotors(importData, false);
    expect(result1.data!.skipped).toBe(1);
    
    // Import with overwrite
    const result2 = importRotors(importData, true);
    expect(result2.data!.imported).toBe(1);
  });

  it('should reject invalid import data', () => {
    const invalidData = {
      version: 1,
      rotors: [{ invalid: 'rotor' }],
      metadata: {},
    };
    
    const result = importRotors(invalidData as any);
    
    expect(result.success).toBe(false);
  });
});

describe('clearAllRotors', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should clear all stored rotors', () => {
    const rotor = createTestRotor();
    addRotor(rotor);
    
    const result = clearAllRotors();
    
    expect(result.success).toBe(true);
    
    // Verify rotors were cleared
    const loadResult = loadRotors();
    expect(loadResult.data!.size).toBe(0);
  });
});
