/**
 * Unit tests for core encryption functionality
 */

import {
  charToIndex,
  indexToChar,
  createActiveRotor,
  stepRotor,
  encryptCharacterThroughRotor,
  decryptCharacterThroughRotor,
  encryptCharacter,
  decryptCharacter,
  encryptText,
  decryptText,
} from '../core';
import { createTestRotor, createIdentityRotor } from '../generator';
import { CHARSET } from '../types';

describe('charToIndex and indexToChar', () => {
  it('should convert characters to indices correctly', () => {
    expect(charToIndex('A')).toBe(0);
    expect(charToIndex('Z')).toBe(25);
    expect(charToIndex('a')).toBe(26);
    expect(charToIndex('z')).toBe(51);
    expect(charToIndex('0')).toBe(52);
    expect(charToIndex('9')).toBe(61);
    expect(charToIndex(' ')).toBe(62);
    expect(charToIndex('.')).toBe(63);
  });

  it('should convert indices to characters correctly', () => {
    expect(indexToChar(0)).toBe('A');
    expect(indexToChar(25)).toBe('Z');
    expect(indexToChar(26)).toBe('a');
    expect(indexToChar(51)).toBe('z');
    expect(indexToChar(52)).toBe('0');
    expect(indexToChar(61)).toBe('9');
    expect(indexToChar(62)).toBe(' ');
    expect(indexToChar(63)).toBe('.');
  });

  it('should be inverse operations', () => {
    for (let i = 0; i < CHARSET.length; i++) {
      const char = indexToChar(i);
      expect(charToIndex(char)).toBe(i);
    }
  });

  it('should reject invalid inputs', () => {
    expect(() => charToIndex('!')).toThrow();
    expect(() => charToIndex('')).toThrow();
    expect(() => indexToChar(-1)).toThrow();
    expect(() => indexToChar(64)).toThrow();
  });
});

describe('createActiveRotor', () => {
  it('should create an active rotor correctly', () => {
    const config = createTestRotor();
    const activeRotor = createActiveRotor(config, 10);
    
    expect(activeRotor.config).toBe(config);
    expect(activeRotor.position).toBe(10);
    expect(activeRotor.stepCount).toBe(0);
  });
});

describe('stepRotor', () => {
  it('should step rotor position forward', () => {
    const config = createTestRotor();
    let rotor = createActiveRotor(config, 1);
    
    rotor = stepRotor(rotor);
    expect(rotor.position).toBe(2);
    expect(rotor.stepCount).toBe(1);
    
    rotor = stepRotor(rotor);
    expect(rotor.position).toBe(3);
    expect(rotor.stepCount).toBe(2);
  });

  it('should wrap position from 64 to 1', () => {
    const config = createTestRotor();
    let rotor = createActiveRotor(config, 64);
    
    rotor = stepRotor(rotor);
    expect(rotor.position).toBe(1);
    expect(rotor.stepCount).toBe(1);
  });
});

describe('encryptCharacterThroughRotor with identity rotor', () => {
  it('should encrypt through identity rotor at position 1', () => {
    const config = createIdentityRotor();
    const rotor = createActiveRotor(config, 1);
    
    // With identity rotor at position 1, character should remain unchanged
    expect(encryptCharacterThroughRotor('A', rotor)).toBe('A');
    expect(encryptCharacterThroughRotor('Z', rotor)).toBe('Z');
    expect(encryptCharacterThroughRotor('a', rotor)).toBe('a');
  });

  it('should apply position offset correctly', () => {
    const config = createIdentityRotor();
    const rotor = createActiveRotor(config, 2); // Position 2 = index 1
    
    // With identity rotor at position 2, each character should shift by 1
    expect(encryptCharacterThroughRotor('A', rotor)).toBe('A'); // 0+1-1 = 0
    expect(encryptCharacterThroughRotor('B', rotor)).toBe('B'); // 1+1-1 = 1
  });
});

describe('encryption/decryption symmetry', () => {
  it('should decrypt to original text with identity rotor', () => {
    const config = createIdentityRotor();
    const encryptRotor = createActiveRotor(config, 5);
    const decryptRotor = createActiveRotor(config, 5);
    
    const original = 'A';
    const encrypted = encryptCharacterThroughRotor(original, encryptRotor);
    const decrypted = decryptCharacterThroughRotor(encrypted, decryptRotor);
    
    expect(decrypted).toBe(original);
  });

  it('should decrypt to original text with test rotor', () => {
    const config = createTestRotor();
    const encryptRotor = createActiveRotor(config, 10);
    const decryptRotor = createActiveRotor(config, 10);
    
    const original = 'Hello';
    let encrypted = '';
    let decrypted = '';
    
    // Encrypt each character
    for (const char of original) {
      encrypted += encryptCharacterThroughRotor(char, encryptRotor);
    }
    
    // Decrypt each character
    for (const char of encrypted) {
      decrypted += decryptCharacterThroughRotor(char, decryptRotor);
    }
    
    expect(decrypted).toBe(original);
  });
});

describe('multi-rotor encryption', () => {
  it('should encrypt and decrypt with multiple rotors', () => {
    const rotor1Config = createTestRotor('Rotor 1');
    const rotor2Config = createIdentityRotor('Rotor 2');
    
    const rotorMap = new Map([
      ['rotor1', rotor1Config],
      ['rotor2', rotor2Config],
    ]);
    
    const config = {
      rotorIds: ['rotor1', 'rotor2'],
      startPositions: [1, 32],
    };
    
    const originalText = 'Hello World.';
    
    const encryptResult = encryptText(originalText, config, rotorMap);
    const decryptResult = decryptText(encryptResult.result, config, rotorMap);
    
    expect(decryptResult.result).toBe(originalText);
  });

  it('should update rotor positions after encryption', () => {
    const rotorConfig = createTestRotor();
    const rotorMap = new Map([['rotor1', rotorConfig]]);
    
    const config = {
      rotorIds: ['rotor1'],
      startPositions: [1],
    };
    
    const result = encryptText('ABC', config, rotorMap);
    
    // After encrypting 3 characters, the rotor should have stepped 3 times
    expect(result.finalPositions[0]).toBe(4); // 1 + 3 steps
    expect(result.charactersProcessed).toBe(3);
  });
});

describe('text encryption validation', () => {
  it('should handle empty text', () => {
    const rotorConfig = createTestRotor();
    const rotorMap = new Map([['rotor1', rotorConfig]]);
    
    const config = {
      rotorIds: ['rotor1'],
      startPositions: [1],
    };
    
    const result = encryptText('', config, rotorMap);
    expect(result.result).toBe('');
    expect(result.charactersProcessed).toBe(0);
    expect(result.finalPositions[0]).toBe(1); // No stepping
  });

  it('should produce deterministic results', () => {
    const rotorConfig = createTestRotor();
    const rotorMap = new Map([['rotor1', rotorConfig]]);
    
    const config = {
      rotorIds: ['rotor1'],
      startPositions: [5],
    };
    
    const text = 'Test Message.';
    const result1 = encryptText(text, config, rotorMap);
    const result2 = encryptText(text, config, rotorMap);
    
    expect(result1.result).toBe(result2.result);
    expect(result1.finalPositions).toEqual(result2.finalPositions);
  });

  it('should handle missing rotor configurations', () => {
    const rotorMap = new Map(); // Empty map
    
    const config = {
      rotorIds: ['nonexistent'],
      startPositions: [1],
    };
    
    expect(() => encryptText('Test', config, rotorMap)).toThrow('not found');
  });
});
