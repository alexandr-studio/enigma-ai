/**
 * Rotor generation utilities
 * 
 * This module provides functions to generate random rotor permutations
 * and create new rotor configurations with proper validation.
 */

import { RotorConfig, RotorPermutation, RotorId } from './types';
import { validateRotorPermutation } from './validation';

/**
 * Generates a cryptographically random permutation of integers 0-63
 * 
 * Uses the Fisher-Yates shuffle algorithm with crypto.getRandomValues()
 * for cryptographically secure randomness.
 * 
 * @returns A random permutation array
 */
export function generateRandomPermutation(): RotorPermutation {
  // Start with ordered array [0, 1, 2, ..., 63]
  const permutation = Array.from({ length: 64 }, (_, i) => i);
  
  // Fisher-Yates shuffle with crypto-random values
  for (let i = permutation.length - 1; i > 0; i--) {
    // Generate random index from 0 to i (inclusive)
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const j = randomArray[0] % (i + 1);
    
    // Swap elements
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  
  // Validate the generated permutation
  validateRotorPermutation(permutation);
  
  return Object.freeze(permutation);
}

/**
 * Generates a unique rotor ID using timestamp and random values
 * 
 * @returns A unique rotor ID string
 */
export function generateRotorId(): RotorId {
  const timestamp = Date.now().toString(36);
  const randomArray = new Uint32Array(2);
  crypto.getRandomValues(randomArray);
  const random = randomArray[0].toString(36) + randomArray[1].toString(36);
  return `rotor_${timestamp}_${random}`;
}

/**
 * Creates a new rotor configuration with a random permutation
 * 
 * @param name - Human-readable name for the rotor
 * @param description - Optional description
 * @returns A new rotor configuration
 */
export function createRandomRotor(name: string, description?: string): RotorConfig {
  const now = new Date();
  
  return {
    id: generateRotorId(),
    name: name.trim(),
    description: description?.trim(),
    permutation: generateRandomPermutation(),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates a rotor configuration with a custom permutation
 * 
 * @param name - Human-readable name for the rotor
 * @param permutation - The custom permutation array
 * @param description - Optional description
 * @returns A new rotor configuration
 */
export function createCustomRotor(
  name: string,
  permutation: readonly number[],
  description?: string
): RotorConfig {
  // Validate the permutation before creating the rotor
  validateRotorPermutation(permutation);
  
  const now = new Date();
  
  return {
    id: generateRotorId(),
    name: name.trim(),
    description: description?.trim(),
    permutation: Object.freeze([...permutation]) as RotorPermutation,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates an updated version of an existing rotor configuration
 * 
 * @param existingRotor - The rotor to update
 * @param updates - Partial updates to apply
 * @returns A new rotor configuration with updates applied
 */
export function updateRotor(
  existingRotor: RotorConfig,
  updates: Partial<Pick<RotorConfig, 'name' | 'description' | 'permutation'>>
): RotorConfig {
  const updatedRotor = {
    ...existingRotor,
    ...updates,
    updatedAt: new Date(),
  };
  
  // If permutation was updated, validate it
  if (updates.permutation) {
    validateRotorPermutation(updates.permutation);
    updatedRotor.permutation = Object.freeze([...updates.permutation]) as RotorPermutation;
  }
  
  return updatedRotor;
}

/**
 * Generates multiple random rotors at once
 * 
 * @param count - Number of rotors to generate
 * @param namePrefix - Prefix for rotor names (will be numbered)
 * @returns Array of new rotor configurations
 */
export function generateMultipleRotors(count: number, namePrefix = 'Rotor'): RotorConfig[] {
  if (count <= 0 || count > 20) {
    throw new Error('Count must be between 1 and 20');
  }
  
  const rotors: RotorConfig[] = [];
  
  for (let i = 1; i <= count; i++) {
    const name = `${namePrefix} ${i}`;
    const description = `Auto-generated rotor ${i} of ${count}`;
    rotors.push(createRandomRotor(name, description));
  }
  
  return rotors;
}

/**
 * Creates a simple test rotor with a predictable permutation (for testing only)
 * 
 * This creates a rotor where each character maps to the next character in the alphabet,
 * wrapping around at the end. This is NOT cryptographically secure and should only
 * be used for testing purposes.
 * 
 * @param name - Name for the test rotor
 * @returns A test rotor configuration
 */
export function createTestRotor(name = 'Test Rotor'): RotorConfig {
  // Simple shift cipher: each position maps to (position + 1) % 64
  const permutation = Array.from({ length: 64 }, (_, i) => (i + 1) % 64);
  
  return createCustomRotor(name, permutation, 'Simple shift cipher for testing');
}

/**
 * Creates an identity rotor (no encryption) for testing
 * 
 * @param name - Name for the identity rotor
 * @returns An identity rotor configuration
 */
export function createIdentityRotor(name = 'Identity Rotor'): RotorConfig {
  // Identity permutation: each position maps to itself
  const permutation = Array.from({ length: 64 }, (_, i) => i);
  
  return createCustomRotor(name, permutation, 'Identity rotor for testing');
}
