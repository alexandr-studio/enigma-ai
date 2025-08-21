# Enigma+ Encryption Web App

A modern web application for encoding and decoding messages using an enhanced Enigma-like encryption system with custom rotor mappings and advanced obfuscation features.

## Features

- **Custom Rotor System**: Define up to 10 rotors with 64-symbol permutations
- **Advanced Obfuscation**: Pre-encryption layer that eliminates word repetitions and structural patterns
- **Local Storage**: All data stored locally in the browser - no cloud dependencies
- **Modern UI**: Built with Next.js, Tailwind CSS v4, and shadcn/ui components
- **Security Enhanced**: Resistant to statistical analysis and pattern recognition attacks

## Tech Stack

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS v4 with warm color palette
- **UI Components**: shadcn/ui for consistent design
- **Package Manager**: pnpm
- **Linting**: ESLint 9 with TypeScript support

## Development Status

🚧 **Currently in development** - See [plan.md](./plan.md) for detailed roadmap.

### Completed
- ✅ Project foundation and setup
- ✅ Next.js configuration with TypeScript
- ✅ Tailwind CSS v4 and basic styling
- ✅ ESLint 9 configuration
- ✅ Project structure creation

### In Progress
- 🔄 Core rotor logic and encryption engine

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (installed globally)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd enigma
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React UI components
├── lib/
│   ├── rotors/            # Core encryption logic
│   ├── storage/           # Local storage utilities
│   ├── obfuscation/       # Advanced obfuscation features
│   └── configuration/     # Configuration management
└── globals.css            # Global styles
```

## Security Considerations

This application implements several security enhancements over traditional Enigma systems:

- **64-symbol alphabet** instead of 26 letters
- **Pre-encryption obfuscation** to eliminate repeated words
- **Sentence shuffling** with position markers
- **Custom rotor definitions** with secure start position codes
- **No external dependencies** for encryption logic

## Contributing

Please see [plan.md](./plan.md) for the development roadmap and current priorities.

## License

This project is for educational and personal use.

---

**Note**: This is an educational implementation inspired by historical Enigma machines, not a historically accurate reproduction.
