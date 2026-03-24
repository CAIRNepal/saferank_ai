# Bias & Safety LLM Leaderboard Frontend

React + TypeScript frontend for a trust-first leaderboard focused on LLM bias and safety.

## Setup

1. Install dependencies:
   npm install
2. Start dev server:
   npm run dev
3. Build production bundle:
   npm run build
4. Run lint:
   npm run lint

## Architecture Overview

- `src/app`: app shell and route definitions.
- `src/pages`: screen-level pages (Overview, Leaderboard, Model Detail, Arena, Methodology, Changelog).
- `src/components/ui`: reusable UI primitives (Card, Badge, Table, Tabs, Tooltip, Modal, Skeleton, Toast).
- `src/components/domain`: domain-specific display units (score and confidence badges).
- `src/mocks`: typed dummy data and simulated async API.
- `src/hooks`: React Query hooks to isolate data fetching.
- `src/styles`: design tokens and global white-theme styling.

## Design Decisions

- White-first visual system with restrained accent usage for a premium, editorial look.
- Readability-focused typography and spacing rhythm using 8px scale.
- Confidence, version, and rank-change cues are surfaced directly in primary views.
- Motion is subtle and functional (hover/focus/tooltip/loader shimmer only).

## Mock Data Structure

Mock layer includes:

- leaderboard models with rank, confidence, version, and axis-level scores
- realistic edge cases: missing values, provisional status, rank ties, outdated benchmark versions
- arena comparison pairs with randomized side ordering
- methodology versions with metric definitions and explicit weights
- changelog entries with impact levels

This frontend is ready to swap mock functions in `src/mocks/api.ts` with real API calls later.
