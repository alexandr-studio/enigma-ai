# Enigma+ Obfuscation Enhancements

## Objective
This scope describes the security-focused adaptations made to the original Enigma concept in this project. These changes dramatically increase resistance against statistical analysis, pattern recognition, and known-plaintext attacks — even before encryption is applied.

---

## Motivation
The original Enigma was broken due to predictable plaintexts, repeated words, rigid structure, and known reflector flaws. This enhanced version ("Enigma+") mitigates those weaknesses through a pre-encryption **obfuscation layer** and **more complex configuration logic**.

---

## Key Enhancements

### 1. Obfuscation Before Encryption
- Repeated words in the plaintext are replaced with **position references**, using randomized mapping.
  - Example: `"rote"` appears at positions 3, 6, 12, and 18  
    → `Ich mag p3/12 Erdbeeren und p6/12 Blumen ...`
- Format: `pX/Y` means:  
  - `pX` = the current position to be replaced  
  - `/Y` = the position whose word should be used as reference
- The word at position `Y` (here: 12) is the **master word** and will **not** be replaced.
- The master word is randomly selected among all repeated instances and remains untouched.
- This results in **zero visible word repetitions**, even before encryption.
- The obfuscation is **lossless** and can be reversed only with the complete position mapping.

---

### 2. Sentence Shuffling
- Sentence or fragment order can be shuffled and **position-marked** (e.g., `.__7`, `.__2`)
- This destroys fixed-position attack vectors (like "Heil Hitler" at the end)
- Reconstruction requires knowledge of the original structure
- The shuffling can be enabled and disbaled by the user in the settings.

---

### 3. Position-Encoded Separators
- Instead of punctuation, positional markers are used:
  - `.` becomes `.__3` → "This is the third sentence"
  - `,` or lists can be tagged similarly
- These markers are **semantically neutral** without the decoding key

---

### 4. 64-Symbol Rotor Support
- Unlike the original 26-letter system, this version uses **64 distinct symbols** (A–Z, 0–9, plus special tokens)
- Allows encryption of **spaces, numbers, punctuation**, and basic control markers
- Rotor permutations are stored as arrays of 64 integers (0–63)

---

### 5. Custom Rotor Definition + Start Code
- Users define rotor sets (e.g., 4 rotors out of 10 saved)
- Only shared reference needed:  
  Example: `12.16.18.4.812736581`  
  → Rotor IDs: 12, 16, 18, 4  
  → Start Positions: 812736581
- Source code can be open — without the rotor definitions or start code, decoding is impossible

---

## Resulting Security Properties

| Threat | Status |
|--------|--------|
| Repeated plaintexts | ❌ Eliminated |
| Known phrases (e.g., "Heil Hitler") | ❌ Unreliable due to shuffling |
| Frequency analysis | ❌ Obfuscated |
| Structural inference | ❌ Impossible without position map |
| Brute-force rotor attack | Infeasible (64^n possibilities) |
| Code leakage | Harmless without rotor IDs + start positions |

---

## Integration in App Flow

1. User inputs plaintext
2. Obfuscation layer transforms text
3. Enigma encryption applied using rotor set + start config
4. Result is transmitted (e.g., via Telegram)
5. Receiver must:
   - Use correct rotor set (predefined or agreed)
   - Set matching start positions
   - Decode rotor output
   - Reverse obfuscation via position mapping

---

## Summary
This enhanced Enigma system is no longer vulnerable to classic weaknesses. It combines **data-independent encryption** with **structure-level obfuscation**, making statistical, brute-force, or semantic attacks extremely difficult — even with full source code access.