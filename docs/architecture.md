# CurvePilot Architecture

```text
User
  │
  ▼
Intent / Asset Profile
  │
  ▼
Curve Recipe Engine
  │
  ├── Curve simulation
  ├── Fee configuration
  └── Graduation configuration
  │
  ▼
Meteora Dynamic Bonding Curve
  │
  ├── Virtual pool
  ├── Trading
  └── Graduation
  │
  ▼
Meteora DAMM v2
  │
  ▼
Post-graduation liquidity
```

## Integration principle

The DBC configuration is not a cosmetic setting. It is the core launch primitive.

## Implementation phases

1. Devnet wallet + read-only DBC state
2. Devnet pool/config creation
3. Devnet swap/quote flow
4. Graduation testing
5. DAMM v2 migration verification
6. Mainnet beta only after end-to-end testing
