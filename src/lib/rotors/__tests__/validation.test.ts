/**
 * Unit tests for rotor validation functions
 */

import {
  validateRotorPermutation,
  validateRotorPosition,
  validateRotorConfig,
  validateEncryptionConfig,
  validateEncryptableText,
  isValidCharacter,
  positionToIndex,
  indexToPosition,
  RotorValidationError,
} from '../validation';
import { createTestRotor, createRandomRotor } from '../generator';
import { CHARSET } from '../types';

describe('validateRotorPermutation', () => {
  it('should accept a valid permutation', () => {
    const validPermutation = Array.from({ length: 64 }, (_, i) => (i + 1) % 64);
    expect(() => validateRotorPermutation(validPermutation)).not.toThrow();
  });

  it('should reject permutation with wrong length', () => {
    const shortPermutation = [0, 1, 2];
    expect(() => validateRotorPermutation(shortPermutation))
      .toThrow(RotorValidationError);
  });

  it('should reject permutation with duplicate values', () => {
    const duplicatePermutation = Array.from({ length: 64 }, () => 0);
    expect(() => validateRotorPermutation(duplicatePermutation))
      .toThrow(RotorValidationError);
  });

  it('should reject permutation with out-of-range values', () => {
    const invalidPermutation = Array.from({ length: 64 }, (_, i) => i === 0 ? 100 : i);
    expect(() => validateRotorPermutation(invalidPermutation))
      .toThrow(RotorValidationError);
  });

  it('should reject permutation with missing values', () => {
    const missingPermutation = Array.from({ length: 64 }, (_, i) => i + 1); // 1-64 instead of 0-63
    expect(() => validateRotorPermutation(missingPermutation))
      .toThrow(RotorValidationError);
  });

  it('should reject permutation with non-integer values', () => {
    const floatPermutation = Array.from({ length: 64 }, (_, i) => i + 0.5);
    expect(() => validateRotorPermutation(floatPermutation))
      .toThrow(RotorValidationError);
  });
});

describe('validateRotorPosition', () => {
  it('should accept valid positions', () => {
    expect(() => validateRotorPosition(1)).not.toThrow();
    expect(() => validateRotorPosition(32)).not.toThrow();
    expect(() => validateRotorPosition(64)).not.toThrow();
  });

  it('should reject positions out of range', () => {
    expect(() => validateRotorPosition(0)).toThrow(RotorValidationError);
    expect(() => validateRotorPosition(65)).toThrow(RotorValidationError);
    expect(() => validateRotorPosition(-1)).toThrow(RotorValidationError);
  });

  it('should reject non-integer positions', () => {
    expect(() => validateRotorPosition(1.5)).toThrow(RotorValidationError);
    expect(() => validateRotorPosition(NaN)).toThrow(RotorValidationError);
  });
});

describe('validateRotorConfig', () => {
  it('should accept a valid rotor configuration', () => {
    const validRotor = createTestRotor();
    expect(() => validateRotorConfig(validRotor)).not.toThrow();
  });

  it('should reject rotor with invalid ID', () => {
    const invalidRotor = { ...createTestRotor(), id: '' };
    expect(() => validateRotorConfig(invalidRotor)).toThrow(RotorValidationError);
  });

  it('should reject rotor with invalid name', () => {
    const invalidRotor = { ...createTestRotor(), name: '' };
    expect(() => validateRotorConfig(invalidRotor)).toThrow(RotorValidationError);
  });

  it('should reject rotor with invalid dates', () => {
    const invalidRotor = { ...createTestRotor(), createdAt: new Date('invalid') };
    expect(() => validateRotorConfig(invalidRotor)).toThrow(RotorValidationError);
  });
});

describe('validateEncryptionConfig', () => {
  it('should accept a valid encryption configuration', () => {
    const validConfig = {
      rotorIds: ['rotor1', 'rotor2'],
      startPositions: [1, 32],
    };
    expect(() => validateEncryptionConfig(validConfig)).not.toThrow();
  });

  it('should reject configuration with no rotors', () => {
    const invalidConfig = {
      rotorIds: [],
      startPositions: [],
    };
    expect(() => validateEncryptionConfig(invalidConfig)).toThrow(RotorValidationError);
  });

  it('should reject configuration with mismatched array lengths', () => {
    const invalidConfig = {
      rotorIds: ['rotor1', 'rotor2'],
      startPositions: [1],
    };
    expect(() => validateEncryptionConfig(invalidConfig)).toThrow(RotorValidationError);
  });

  it('should reject configuration with duplicate rotor IDs', () => {
    const invalidConfig = {
      rotorIds: ['rotor1', 'rotor1'],
      startPositions: [1, 32],
    };
    expect(() => validateEncryptionConfig(invalidConfig)).toThrow(RotorValidationError);
  });

  it('should reject configuration with too many rotors', () => {
    const tooManyRotors = Array.from({ length: 10 }, (_, i) => `rotor${i}`);
    const tooManyPositions = Array.from({ length: 10 }, () => 1);
    const invalidConfig = {
      rotorIds: tooManyRotors,
      startPositions: tooManyPositions,
    };
    expect(() => validateEncryptionConfig(invalidConfig)).toThrow(RotorValidationError);
  });
});

describe('isValidCharacter', () => {
  it('should accept all characters in CHARSET', () => {
    for (const char of CHARSET) {
      expect(isValidCharacter(char)).toBe(true);
    }
  });

  it('should reject characters not in CHARSET', () => {
    expect(isValidCharacter('!')).toBe(false);
    expect(isValidCharacter('@')).toBe(false);
    expect(isValidCharacter('ñ')).toBe(false);
    expect(isValidCharacter('€')).toBe(false);
  });

  it('should reject empty strings and multi-character strings', () => {
    expect(isValidCharacter('')).toBe(false);
    expect(isValidCharacter('ab')).toBe(false);
  });
});

describe('validateEncryptableText', () => {
  it('should accept text with only valid characters', () => {
    expect(() => validateEncryptableText('Hello World 123.')).not.toThrow();
    expect(() => validateEncryptableText('')).not.toThrow();
    expect(() => validateEncryptableText('ABCabc123 .')).not.toThrow();
  });

  it('should reject text with invalid characters', () => {
    expect(() => validateEncryptableText('Hello@World')).toThrow(RotorValidationError);
    expect(() => validateEncryptableText('Café')).toThrow(RotorValidationError);
    expect(() => validateEncryptableText('Price: $5.99')).toThrow(RotorValidationError);
  });
});

describe('positionToIndex and indexToPosition', () => {
  it('should convert positions correctly', () => {
    expect(positionToIndex(1)).toBe(0);
    expect(positionToIndex(32)).toBe(31);
    expect(positionToIndex(64)).toBe(63);
  });

  it('should convert indices correctly', () => {
    expect(indexToPosition(0)).toBe(1);
    expect(indexToPosition(31)).toBe(32);
    expect(indexToPosition(63)).toBe(64);
  });

  it('should be inverse operations', () => {
    for (let pos = 1; pos <= 64; pos++) {
      expect(indexToPosition(positionToIndex(pos))).toBe(pos);
    }
    
    for (let idx = 0; idx < 64; idx++) {
      expect(positionToIndex(indexToPosition(idx))).toBe(idx);
    }
  });

  it('should reject invalid inputs', () => {
    expect(() => positionToIndex(0)).toThrow();
    expect(() => positionToIndex(65)).toThrow();
    expect(() => indexToPosition(-1)).toThrow();
    expect(() => indexToPosition(64)).toThrow();
  });
});
