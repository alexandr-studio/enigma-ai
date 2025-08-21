/**
 * Validation functions for rotor configurations and operations
 * 
 * This module ensures the integrity of rotor permutations and validates
 * user inputs for positions and configurations.
 */

import {
  RotorPermutation,
  RotorPosition,
  RotorConfig,
  EncryptionConfig,
  CHARSET,
  ROTOR_POSITION_MIN,
  ROTOR_POSITION_MAX,
  MAX_ACTIVE_ROTORS,
} from './types';

/**
 * Error thrown when rotor validation fails
 */
export class RotorValidationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'RotorValidationError';
  }
}

/**
 * Validates that a permutation array is a valid rotor configuration
 * 
 * A valid permutation must:
 * - Contain exactly 64 elements
 * - Each element must be an integer from 0 to 63
 * - Each integer 0-63 must appear exactly once
 * 
 * @param permutation - The permutation array to validate
 * @throws RotorValidationError if validation fails
 */
export function validateRotorPermutation(permutation: readonly number[]): void {
  // Check length
  if (permutation.length !== 64) {
    throw new RotorValidationError(
      `Rotor permutation must contain exactly 64 elements, got ${permutation.length}`,
      'INVALID_LENGTH'
    );
  }

  // Check that all elements are valid integers
  for (let i = 0; i < permutation.length; i++) {
    const value = permutation[i];
    if (!Number.isInteger(value)) {
      throw new RotorValidationError(
        `Permutation element at index ${i} is not an integer: ${value}`,
        'NON_INTEGER_ELEMENT'
      );
    }
    if (value < 0 || value > 63) {
      throw new RotorValidationError(
        `Permutation element at index ${i} is out of range (0-63): ${value}`,
        'OUT_OF_RANGE_ELEMENT'
      );
    }
  }

  // Check that each value 0-63 appears exactly once
  const seen = new Set<number>();
  const duplicates: number[] = [];
  
  for (const value of permutation) {
    if (seen.has(value)) {
      duplicates.push(value);
    } else {
      seen.add(value);
    }
  }

  if (duplicates.length > 0) {
    throw new RotorValidationError(
      `Permutation contains duplicate values: ${duplicates.join(', ')}`,
      'DUPLICATE_VALUES'
    );
  }

  // Check that all values 0-63 are present
  const missing: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (!seen.has(i)) {
      missing.push(i);
    }
  }

  if (missing.length > 0) {
    throw new RotorValidationError(
      `Permutation is missing values: ${missing.join(', ')}`,
      'MISSING_VALUES'
    );
  }
}

/**
 * Validates that a rotor position is within the valid range (1-64)
 * 
 * @param position - The position to validate
 * @throws RotorValidationError if position is invalid
 */
export function validateRotorPosition(position: number): void {
  if (!Number.isInteger(position)) {
    throw new RotorValidationError(
      `Rotor position must be an integer, got ${position}`,
      'NON_INTEGER_POSITION'
    );
  }

  if (position < ROTOR_POSITION_MIN || position > ROTOR_POSITION_MAX) {
    throw new RotorValidationError(
      `Rotor position must be between ${ROTOR_POSITION_MIN} and ${ROTOR_POSITION_MAX}, got ${position}`,
      'POSITION_OUT_OF_RANGE'
    );
  }
}

/**
 * Validates a complete rotor configuration
 * 
 * @param config - The rotor configuration to validate
 * @throws RotorValidationError if configuration is invalid
 */
export function validateRotorConfig(config: RotorConfig): void {
  // Validate basic properties
  if (!config.id || typeof config.id !== 'string' || config.id.trim().length === 0) {
    throw new RotorValidationError(
      'Rotor configuration must have a non-empty string ID',
      'INVALID_ID'
    );
  }

  if (!config.name || typeof config.name !== 'string' || config.name.trim().length === 0) {
    throw new RotorValidationError(
      'Rotor configuration must have a non-empty string name',
      'INVALID_NAME'
    );
  }

  if (!(config.createdAt instanceof Date) || isNaN(config.createdAt.getTime())) {
    throw new RotorValidationError(
      'Rotor configuration must have a valid createdAt date',
      'INVALID_CREATED_DATE'
    );
  }

  if (!(config.updatedAt instanceof Date) || isNaN(config.updatedAt.getTime())) {
    throw new RotorValidationError(
      'Rotor configuration must have a valid updatedAt date',
      'INVALID_UPDATED_DATE'
    );
  }

  // Validate the permutation
  validateRotorPermutation(config.permutation);
}

/**
 * Validates an encryption configuration
 * 
 * @param config - The encryption configuration to validate
 * @throws RotorValidationError if configuration is invalid
 */
export function validateEncryptionConfig(config: EncryptionConfig): void {
  // Check rotor IDs array
  if (!Array.isArray(config.rotorIds)) {
    throw new RotorValidationError(
      'Encryption configuration must have a rotorIds array',
      'INVALID_ROTOR_IDS'
    );
  }

  if (config.rotorIds.length === 0) {
    throw new RotorValidationError(
      'Encryption configuration must specify at least one rotor',
      'NO_ROTORS_SPECIFIED'
    );
  }

  if (config.rotorIds.length > MAX_ACTIVE_ROTORS) {
    throw new RotorValidationError(
      `Encryption configuration cannot use more than ${MAX_ACTIVE_ROTORS} rotors, got ${config.rotorIds.length}`,
      'TOO_MANY_ROTORS'
    );
  }

  // Check start positions array
  if (!Array.isArray(config.startPositions)) {
    throw new RotorValidationError(
      'Encryption configuration must have a startPositions array',
      'INVALID_START_POSITIONS'
    );
  }

  if (config.startPositions.length !== config.rotorIds.length) {
    throw new RotorValidationError(
      `Number of start positions (${config.startPositions.length}) must match number of rotors (${config.rotorIds.length})`,
      'POSITION_COUNT_MISMATCH'
    );
  }

  // Validate each position
  config.startPositions.forEach((position, index) => {
    try {
      validateRotorPosition(position);
    } catch (error) {
      if (error instanceof RotorValidationError) {
        throw new RotorValidationError(
          `Invalid start position at index ${index}: ${error.message}`,
          'INVALID_START_POSITION'
        );
      }
      throw error;
    }
  });

  // Check for duplicate rotor IDs
  const uniqueRotorIds = new Set(config.rotorIds);
  if (uniqueRotorIds.size !== config.rotorIds.length) {
    throw new RotorValidationError(
      'Encryption configuration cannot use the same rotor multiple times',
      'DUPLICATE_ROTOR_IDS'
    );
  }
}

/**
 * Validates that a character can be encrypted by the rotor system
 * 
 * @param char - The character to validate
 * @returns true if the character is valid, false otherwise
 */
export function isValidCharacter(char: string): boolean {
  return char.length === 1 && CHARSET.includes(char);
}

/**
 * Validates that a string contains only characters that can be encrypted
 * 
 * @param text - The text to validate
 * @throws RotorValidationError if text contains invalid characters
 */
export function validateEncryptableText(text: string): void {
  const invalidChars: string[] = [];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (!isValidCharacter(char)) {
      if (!invalidChars.includes(char)) {
        invalidChars.push(char);
      }
    }
  }

  if (invalidChars.length > 0) {
    throw new RotorValidationError(
      `Text contains characters that cannot be encrypted: ${invalidChars.map(c => `'${c}'`).join(', ')}`,
      'INVALID_CHARACTERS'
    );
  }
}

/**
 * Safely converts a user-facing rotor position (1-64) to internal array index (0-63)
 * 
 * @param position - User-facing position (1-64)
 * @returns Internal array index (0-63)
 */
export function positionToIndex(position: RotorPosition): number {
  validateRotorPosition(position);
  return position - 1;
}

/**
 * Safely converts an internal array index (0-63) to user-facing position (1-64)
 * 
 * @param index - Internal array index (0-63)
 * @returns User-facing position (1-64)
 */
export function indexToPosition(index: number): RotorPosition {
  if (!Number.isInteger(index) || index < 0 || index > 63) {
    throw new RotorValidationError(
      `Array index must be between 0 and 63, got ${index}`,
      'INVALID_ARRAY_INDEX'
    );
  }
  return index + 1;
}
