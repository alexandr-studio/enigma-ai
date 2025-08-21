/**
 * Unit tests for localStorage wrapper functions
 */

import {
  isLocalStorageAvailable,
  getStorageQuota,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearEnigmaStorage,
  initializeStorage,
  estimateStorageSize,
} from '../localStorage';
import { STORAGE_KEYS } from '../types';

// Mock localStorage for testing
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

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('isLocalStorageAvailable', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should return true when localStorage is available', () => {
    expect(isLocalStorageAvailable()).toBe(true);
  });

  it('should return false when localStorage throws an error', () => {
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new Error('localStorage not available');
    });
    
    expect(isLocalStorageAvailable()).toBe(false);
  });
});

describe('getStorageQuota', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should return quota information', () => {
    const quota = getStorageQuota();
    
    expect(quota).toMatchObject({
      used: expect.any(Number),
      available: expect.any(Number),
      percentage: expect.any(Number),
      canStore: expect.any(Boolean),
    });
    
    expect(quota.used).toBeGreaterThanOrEqual(0);
    expect(quota.available).toBeGreaterThanOrEqual(0);
    expect(quota.percentage).toBeGreaterThanOrEqual(0);
    expect(quota.percentage).toBeLessThanOrEqual(100);
  });

  it('should return no storage when localStorage is unavailable', () => {
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true,
    });

    const quota = getStorageQuota();
    
    expect(quota).toEqual({
      used: 0,
      available: 0,
      percentage: 100,
      canStore: false,
    });

    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });
});

describe('getStorageItem', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should retrieve stored items successfully', () => {
    const testData = { test: 'value' };
    mockLocalStorage.setItem('test-key', JSON.stringify(testData));
    
    const result = getStorageItem('test-key');
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual(testData);
  });

  it('should return undefined for non-existent items', () => {
    const result = getStorageItem('non-existent');
    
    expect(result.success).toBe(true);
    expect(result.data).toBeUndefined();
  });

  it('should handle JSON parsing errors', () => {
    mockLocalStorage.setItem('invalid-json', 'invalid{json');
    
    const result = getStorageItem('invalid-json');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unexpected token');
  });
});

describe('setStorageItem', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should store items successfully', () => {
    const testData = { test: 'value' };
    
    const result = setStorageItem('test-key', testData);
    
    expect(result.success).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify(testData)
    );
  });

  it('should handle storage quota errors', () => {
    // Mock getItem/removeItem to work normally but setItem to fail
    mockLocalStorage.getItem.mockReturnValueOnce('test');
    mockLocalStorage.removeItem.mockImplementationOnce(() => {});
    
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      // First call for availability test - should succeed
    }).mockImplementationOnce(() => {
      // Second call for actual storage - should fail
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });
    
    const result = setStorageItem('test-key', 'test-value');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Storage quota exceeded');
  });
});

describe('removeStorageItem', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should remove items successfully', () => {
    const result = removeStorageItem('test-key');
    
    expect(result.success).toBe(true);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
  });
});

describe('clearEnigmaStorage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should clear all Enigma storage keys', () => {
    const result = clearEnigmaStorage();
    
    expect(result.success).toBe(true);
    
    // Verify all storage keys were removed
    Object.values(STORAGE_KEYS).forEach(key => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });
});

describe('initializeStorage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize storage with current version', () => {
    const result = initializeStorage();
    
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      version: 0, // No previous version
      migrationNeeded: true,
    });
  });

  it('should detect existing version', () => {
    mockLocalStorage.setItem(STORAGE_KEYS.VERSION, '1');
    
    const result = initializeStorage();
    
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      version: 1,
      migrationNeeded: false,
    });
  });
});

describe('estimateStorageSize', () => {
  it('should estimate object size correctly', () => {
    const testObject = { test: 'value' };
    const size = estimateStorageSize(testObject);
    
    expect(size).toBeGreaterThan(0);
    expect(typeof size).toBe('number');
  });

  it('should handle circular references gracefully', () => {
    const circular: any = { test: 'value' };
    circular.self = circular;
    
    const size = estimateStorageSize(circular);
    
    expect(size).toBe(0); // Should return 0 for unstringifiable objects
  });
});
