/**
 * Core Enigma+ encryption and decryption engine
 * 
 * This module implements the heart of the rotor-based encryption system,
 * including character encoding/decoding, rotor stepping, and the main
 * encryption/decryption algorithms.
 */

import {
  RotorPermutation,
  RotorPosition,
  RotorConfig,
  ActiveRotor,
  EncryptionConfig,
  CryptographyResult,
  CHARSET,
} from './types';
import {
  validateRotorConfig,
  validateEncryptionConfig,
  validateEncryptableText,
  positionToIndex,
  indexToPosition,
  isValidCharacter,
} from './validation';

/**
 * Converts a character to its index in the 64-symbol charset
 * 
 * @param char - The character to convert
 * @returns The index (0-63) of the character in CHARSET
 * @throws Error if character is not in charset
 */
export function charToIndex(char: string): number {
  if (char.length !== 1) {
    throw new Error(`Expected single character, got: '${char}'`);
  }
  const index = CHARSET.indexOf(char);
  if (index === -1) {
    throw new Error(`Character '${char}' is not in the supported charset`);
  }
  return index;
}

/**
 * Converts an index to its corresponding character in the charset
 * 
 * @param index - The index (0-63) in the charset
 * @returns The character at that position
 * @throws Error if index is out of range
 */
export function indexToChar(index: number): string {
  if (index < 0 || index >= CHARSET.length) {
    throw new Error(`Index ${index} is out of range (0-${CHARSET.length - 1})`);
  }
  return CHARSET[index];
}

/**
 * Creates an active rotor from a rotor configuration and starting position
 * 
 * @param config - The rotor configuration
 * @param startPosition - Starting position (1-64)
 * @returns Active rotor ready for encryption/decryption
 */
export function createActiveRotor(config: RotorConfig, startPosition: RotorPosition): ActiveRotor {
  validateRotorConfig(config);
  return {
    config,
    position: startPosition,
    stepCount: 0,
  };
}

/**
 * Steps a rotor forward by one position
 * 
 * When a rotor steps, its position advances by 1 (wrapping from 64 to 1),
 * and the step count increases. This affects how the rotor maps characters.
 * 
 * @param rotor - The active rotor to step
 * @returns A new rotor with updated position and step count
 */
export function stepRotor(rotor: ActiveRotor): ActiveRotor {
  const newPosition = rotor.position === 64 ? 1 : rotor.position + 1;
  return {
    ...rotor,
    position: newPosition,
    stepCount: rotor.stepCount + 1,
  };
}

/**
 * Encrypts a single character through a rotor in the forward direction
 * 
 * The rotor's current position affects the mapping by rotating the permutation.
 * This simulates the physical rotation of an Enigma machine rotor.
 * 
 * @param char - The character to encrypt
 * @param rotor - The active rotor to use
 * @returns The encrypted character
 */
export function encryptCharacterThroughRotor(char: string, rotor: ActiveRotor): string {
  if (!isValidCharacter(char)) {
    throw new Error(`Cannot encrypt invalid character: '${char}'`);
  }

  const inputIndex = charToIndex(char);
  const rotorOffset = positionToIndex(rotor.position);
  
  // Apply rotor position offset to input
  const adjustedInputIndex = (inputIndex + rotorOffset) % 64;
  
  // Get the permuted output
  const permutedIndex = rotor.config.permutation[adjustedInputIndex];
  
  // Apply rotor position offset to output (reverse direction)
  const finalOutputIndex = (permutedIndex - rotorOffset + 64) % 64;
  
  return indexToChar(finalOutputIndex);
}

/**
 * Decrypts a single character through a rotor in the reverse direction
 * 
 * This reverses the encryption process by finding which input character
 * would produce the given output character.
 * 
 * @param char - The character to decrypt
 * @param rotor - The active rotor to use
 * @returns The decrypted character
 */
export function decryptCharacterThroughRotor(char: string, rotor: ActiveRotor): string {
  if (!isValidCharacter(char)) {
    throw new Error(`Cannot decrypt invalid character: '${char}'`);
  }

  const outputIndex = charToIndex(char);
  const rotorOffset = positionToIndex(rotor.position);
  
  // Apply rotor position offset to output
  const adjustedOutputIndex = (outputIndex + rotorOffset) % 64;
  
  // Find the input index that produces this output
  const permutation = rotor.config.permutation;
  const inputIndex = permutation.indexOf(adjustedOutputIndex);
  
  if (inputIndex === -1) {
    throw new Error(`Invalid rotor permutation: output ${adjustedOutputIndex} not found`);
  }
  
  // Apply rotor position offset to input (reverse direction)
  const finalInputIndex = (inputIndex - rotorOffset + 64) % 64;
  
  return indexToChar(finalInputIndex);
}

/**
 * Encrypts a single character through multiple rotors
 * 
 * The character passes through each rotor in sequence (left to right),
 * then the rightmost rotor steps forward.
 * 
 * @param char - The character to encrypt
 * @param rotors - Array of active rotors (will be modified in place)
 * @returns The encrypted character
 */
export function encryptCharacter(char: string, rotors: ActiveRotor[]): string {
  if (rotors.length === 0) {
    throw new Error('Cannot encrypt with no rotors');
  }

  let result = char;
  
  // Pass through each rotor in forward direction
  for (const rotor of rotors) {
    result = encryptCharacterThroughRotor(result, rotor);
  }
  
  // Step the rightmost rotor
  const lastRotorIndex = rotors.length - 1;
  rotors[lastRotorIndex] = stepRotor(rotors[lastRotorIndex]);
  
  // Check for rotor stepping cascade (simple implementation)
  // In a real Enigma, rotors have notches that cause the next rotor to step
  // For simplicity, we'll step the next rotor every 64 steps of the current rotor
  for (let i = lastRotorIndex; i > 0; i--) {
    if (rotors[i].stepCount % 64 === 0) {
      rotors[i - 1] = stepRotor(rotors[i - 1]);
    } else {
      break; // No cascade needed
    }
  }
  
  return result;
}

/**
 * Decrypts a single character through multiple rotors
 * 
 * This reverses the encryption process. First the rightmost rotor steps
 * (to match the state during encryption), then the character passes
 * through rotors in reverse order.
 * 
 * @param char - The character to decrypt
 * @param rotors - Array of active rotors (will be modified in place)
 * @returns The decrypted character
 */
export function decryptCharacter(char: string, rotors: ActiveRotor[]): string {
  if (rotors.length === 0) {
    throw new Error('Cannot decrypt with no rotors');
  }

  // Step the rightmost rotor first (to match encryption state)
  const lastRotorIndex = rotors.length - 1;
  rotors[lastRotorIndex] = stepRotor(rotors[lastRotorIndex]);
  
  // Check for rotor stepping cascade
  for (let i = lastRotorIndex; i > 0; i--) {
    if (rotors[i].stepCount % 64 === 0) {
      rotors[i - 1] = stepRotor(rotors[i - 1]);
    } else {
      break;
    }
  }
  
  let result = char;
  
  // Pass through rotors in reverse order
  for (let i = rotors.length - 1; i >= 0; i--) {
    result = decryptCharacterThroughRotor(result, rotors[i]);
  }
  
  return result;
}

/**
 * Encrypts a complete text string using the rotor configuration
 * 
 * @param text - The plaintext to encrypt
 * @param config - The encryption configuration
 * @param availableRotors - Map of rotor IDs to rotor configurations
 * @returns The encryption result
 */
export function encryptText(
  text: string,
  config: EncryptionConfig,
  availableRotors: Map<string, RotorConfig>
): CryptographyResult {
  validateEncryptionConfig(config);
  validateEncryptableText(text);
  
  // Create active rotors
  const activeRotors: ActiveRotor[] = config.rotorIds.map((rotorId, index) => {
    const rotorConfig = availableRotors.get(rotorId);
    if (!rotorConfig) {
      throw new Error(`Rotor with ID '${rotorId}' not found`);
    }
    return createActiveRotor(rotorConfig, config.startPositions[index]);
  });
  
  let result = '';
  const warnings: string[] = [];
  
  // Encrypt each character
  for (const char of text) {
    if (isValidCharacter(char)) {
      result += encryptCharacter(char, activeRotors);
    } else {
      warnings.push(`Skipped invalid character: '${char}'`);
    }
  }
  
  return {
    result,
    finalPositions: activeRotors.map(rotor => rotor.position),
    charactersProcessed: text.length,
    obfuscationApplied: false, // TODO: Implement obfuscation in Phase 6
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Decrypts a complete text string using the rotor configuration
 * 
 * @param ciphertext - The encrypted text to decrypt
 * @param config - The encryption configuration (same as used for encryption)
 * @param availableRotors - Map of rotor IDs to rotor configurations
 * @returns The decryption result
 */
export function decryptText(
  ciphertext: string,
  config: EncryptionConfig,
  availableRotors: Map<string, RotorConfig>
): CryptographyResult {
  validateEncryptionConfig(config);
  validateEncryptableText(ciphertext);
  
  // Create active rotors with same starting positions
  const activeRotors: ActiveRotor[] = config.rotorIds.map((rotorId, index) => {
    const rotorConfig = availableRotors.get(rotorId);
    if (!rotorConfig) {
      throw new Error(`Rotor with ID '${rotorId}' not found`);
    }
    return createActiveRotor(rotorConfig, config.startPositions[index]);
  });
  
  let result = '';
  const warnings: string[] = [];
  
  // Decrypt each character
  for (const char of ciphertext) {
    if (isValidCharacter(char)) {
      result += decryptCharacter(char, activeRotors);
    } else {
      warnings.push(`Skipped invalid character: '${char}'`);
    }
  }
  
  return {
    result,
    finalPositions: activeRotors.map(rotor => rotor.position),
    charactersProcessed: ciphertext.length,
    obfuscationApplied: false, // TODO: Implement obfuscation in Phase 6
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
