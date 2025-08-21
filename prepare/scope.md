Let's create a web app which encodes and decodes messages using Enigma encryption.

Help me think through how to break this into iterative pieces and write a `plan.md`.

---

## Requirements

- Users define their own rotor mappings: each rotor is a permutation of 64 unique numbers (0–63).
- The application helps with this by generating a random mapping which users can adjust manually.
- Users can define up to 10 rotors and store them locally in the browser.
- Users can input a message and press "encode" or "decode".
- Before encoding or decoding, users must set the start position (1–64) of each rotor.

---

## Design

- Minimal, functional, practical
- Intentional use of color
- Warmer tones
- Inspired by social apps

---

## Tech Stack

**Frontend**  
- Next.js with React  
- Tailwind CSS v4  
- shadcn/ui  
- eslint 9

**Backend**  
- Not required (fully local)

**Infrastructure**  
- GitHub (repo)  
- Vercel (deployment)

---

## Out of Scope

- No user authentication or account system
- No cloud-based storage or syncing
- No support for symbols/emoji in text — only character-based mapping for now
- No historical accuracy emulation of WW2 Enigma machines — this is **inspired**, not replicated

---

## Success Criteria

- Messages can be encoded/decoded identically with the same rotor set + start position
- Rotor configuration and settings persist in local storage
- UI remains simple and functional across desktop and mobile
- All core logic is written clean, documented, and testable

---

Please:
- Check off completed items in the plan as a to-do list.
- Add open questions if anything requires my input.


