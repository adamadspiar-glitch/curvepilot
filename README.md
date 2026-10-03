# CurvePilot

**Programmable liquidity launch infrastructure for Solana, powered by Meteora Dynamic Bonding Curve.**

CurvePilot turns an asset-launch intent into a configurable Meteora DBC launch plan.

## Core flow

`Asset intent → Curve recipe → Simulation → Meteora DBC launch → Graduation → DAMM v2`

## Why CurvePilot?

Most token launchers treat the bonding curve as an implementation detail. CurvePilot makes the curve itself a product primitive.

Builders can:
- choose an asset profile (AI, RWA, tokenized stock, community, custom)
- generate a reusable curve recipe
- simulate the configuration before launch
- launch through Meteora DBC
- monitor progress toward graduation
- transition to post-graduation liquidity

## Current status

This repository is the **public MVP scaffold** for the hackathon submission.

Do not claim a feature as live until its corresponding on-chain integration has been tested and deployed.

## Tech stack

- Next.js / React
- TypeScript
- Solana wallet tooling
- `@meteora-ag/dynamic-bonding-curve-sdk`
- Meteora DBC
- Meteora DAMM v2 (post-graduation integration)
- AI configuration layer

## Repository structure

```text
curvepilot/
├── apps/
│   └── web/
├── packages/
│   └── curve-engine/
├── docs/
│   ├── architecture.md
│   ├── demo-script.md
│   └── hackathon-submission.md
├── .env.example
├── package.json
└── README.md
```

## Local development

Requirements:
- Node.js 18+
- pnpm
- Solana wallet

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and fill only the variables required by the features you have actually implemented.

## Meteora integration

Meteora's official Dynamic Bonding Curve SDK is used for DBC integration.

```bash
pnpm add @meteora-ag/dynamic-bonding-curve-sdk
```

Official references:
- https://docs.meteora.ag/developer-guides/dbc
- https://github.com/MeteoraAg/dynamic-bonding-curve-sdk

## Safety / launch policy

Never expose a wallet private key or seed phrase in the frontend or repository.

Use devnet for integration testing first. Mainnet transactions should require explicit wallet approval.

## Hackathon

Track: Meteora — Crypto World's Fair

Prize pool listed by the sponsor: $20,000 USDC.

The final submission should include only links and capabilities that are publicly accessible and actually implemented.
