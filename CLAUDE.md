# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Architecture Overview

This is a Next.js 15 TypeScript application for TrustBridge, a cross-border payment system using Cardano blockchain and WhatsApp integration.

### Core Architecture Patterns

**MeshSDK Integration**: The app uses `@meshsdk/core` and `@meshsdk/react` for Cardano blockchain interactions. All wallet operations go through the MeshProvider and custom WalletContext.

**Context-Based State Management**:
- `src/contexts/WalletContext.tsx` - Central wallet state management with functions for connecting wallets, balance tracking, and transaction handling
- Provides hooks like `useWallet()` for accessing wallet state throughout the app

**Service Layer Architecture**:
- `src/lib/aiService.ts` - AI-powered chat assistance using Google Gemini API with fallback responses
- `src/lib/smartContractService.ts` - Handles escrow payments, multi-signature wallets, and dispute resolution
- `src/lib/walletService.ts` - Manages wallet contacts and WhatsApp integration utilities

**UI Component System**: Uses shadcn/ui components with Tailwind CSS. Components are in `src/components/ui/` with configuration in `components.json`.

### Key Technical Patterns

**Wallet Integration Flow**:
1. MeshProvider wraps the entire app in `_app.tsx`
2. WalletProvider manages connection state and provides wallet context
3. Components use `useWallet()` hook to access wallet functionality
4. Transactions built using `Transaction` class from MeshSDK

**Transaction Metadata Usage**: Smart contract operations store metadata using key `674` on Cardano transactions to track escrow, multi-sig, and dispute data.

**WhatsApp Integration**: Payment links are generated through `WalletService.generateWhatsAppLink()` which creates WhatsApp URLs with pre-filled payment messages.

## Path Aliases

- `@/*` maps to `src/*` (configured in tsconfig.json)
- Use `@/components` for UI components
- Use `@/lib` for services and utilities
- Use `@/contexts` for React contexts

## Styling

- Uses Tailwind CSS with custom animations and effects
- Dark theme by default with custom CSS classes like `glass-effect`, `glow-effect`, `text-glow`
- Responsive design with mobile-first approach
- Custom animations defined in `tailwind.config.ts`

## Environment Variables

- `NEXT_PUBLIC_GEMINI_API_KEY` - Google Gemini AI API key for chat functionality
- API keys should be prefixed with `NEXT_PUBLIC_` for client-side access

## Important Notes

- This is a Cardano-focused application - all blockchain operations should use MeshSDK
- The app expects Cardano wallet extensions (Eternl, Nami, etc.) to be available in the browser
- Smart contract operations are currently demo implementations using transaction metadata
- WhatsApp integration is through URL generation, not direct API integration