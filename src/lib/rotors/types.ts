/**
 * Type definitions for the Enigma+ rotor system
 * 
 * This module defines the core data structures used throughout the encryption system.
 * The system uses 64-symbol permutations instead of the traditional 26-letter alphabet
 * to support numbers, letters, spaces, and basic punctuation.
 */

/**
 * A rotor permutation maps each of 64 input symbols to a unique output symbol.
 * The array contains integers 0-63, each appearing exactly once.
 * 
 * Symbol mapping:
 * 0-25: A-Z (uppercase letters)
 * 26-51: a-z (lowercase letters)  
 * 52-61: 0-9 (digits)
 * 62: space character
 * 63: period (.)
 */
export type RotorPermutation = readonly number[];

/**
 * Position of a rotor, ranging from 1 to 64 (user-facing)
 * Internally converted to 0-63 for array indexing
 */
export type RotorPosition = number;

/**
 * Unique identifier for a rotor configuration
 */
export type RotorId = string;

/**
 * Complete rotor configuration with metadata
 */
export interface RotorConfig {
  /** Unique identifier for this rotor */
  readonly id: RotorId;
  
  /** Human-readable name for the rotor */
  readonly name: string;
  
  /** Optional description of the rotor */
  readonly description?: string;
  
  /** The permutation array defining symbol mappings */
  readonly permutation: RotorPermutation;
  
  /** Timestamp when this rotor was created */
  readonly createdAt: Date;
  
  /** Timestamp when this rotor was last modified */
  readonly updatedAt: Date;
}

/**
 * Runtime state of an active rotor during encryption/decryption
 */
export interface ActiveRotor {
  /** Reference to the rotor configuration */
  readonly config: RotorConfig;
  
  /** Current position (1-64, user-facing) */
  position: RotorPosition;
  
  /** Number of steps taken since initialization */
  stepCount: number;
}

/**
 * Set of rotors configured for encryption/decryption operation
 */
export interface RotorSet {
  /** Array of active rotors in order (leftmost to rightmost) */
  readonly rotors: readonly ActiveRotor[];
  
  /** Unique identifier for this rotor set configuration */
  readonly id: string;
  
  /** Human-readable name for this rotor set */
  readonly name: string;
}

/**
 * Configuration for starting an encryption/decryption session
 */
export interface EncryptionConfig {
  /** IDs of rotors to use, in order */
  readonly rotorIds: readonly RotorId[];
  
  /** Starting positions for each rotor (1-64) */
  readonly startPositions: readonly RotorPosition[];
  
  /** Optional settings for obfuscation features */
  readonly obfuscationSettings?: ObfuscationSettings;
}

/**
 * Settings for advanced obfuscation features
 */
export interface ObfuscationSettings {
  /** Enable word repetition replacement with position references */
  enableWordReplacement: boolean;
  
  /** Enable sentence shuffling with position markers */
  enableSentenceShuffling: boolean;
  
  /** Enable position-encoded separators */
  enablePositionEncodedSeparators: boolean;
  
  /** Minimum word length to consider for replacement (default: 3) */
  minWordLength: number;
}

/**
 * Result of an encryption or decryption operation
 */
export interface CryptographyResult {
  /** The resulting text */
  readonly result: string;
  
  /** Final positions of all rotors after operation */
  readonly finalPositions: readonly RotorPosition[];
  
  /** Number of characters processed */
  readonly charactersProcessed: number;
  
  /** Whether obfuscation was applied */
  readonly obfuscationApplied: boolean;
  
  /** Any warnings or notes about the operation */
  readonly warnings?: readonly string[];
}

/**
 * The 64-symbol character set used by the rotor system
 */
export const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .' as const;

/**
 * The size of the character set (64 symbols)
 */
export const CHARSET_SIZE = CHARSET.length;

/**
 * Maximum number of rotors that can be stored
 */
export const MAX_STORED_ROTORS = 10;

/**
 * Maximum number of rotors that can be used in a single encryption
 */
export const MAX_ACTIVE_ROTORS = 8;

/**
 * Valid rotor position range
 */
export const ROTOR_POSITION_MIN = 1;
export const ROTOR_POSITION_MAX = 64;

/**
 * Symbol indices for special characters
 */
export const SYMBOL_INDICES = {
  SPACE: 62,
  PERIOD: 63,
} as const;
