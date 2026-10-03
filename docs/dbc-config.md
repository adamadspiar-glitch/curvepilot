# CurvePilot DBC configuration

CurvePilot creates a reusable Meteora Dynamic Bonding Curve partner config directly from the connected wallet.

## Flow

1. Connect Phantom or Solflare on Solana Devnet.
2. Choose an asset profile and fee.
3. Click **Create DBC config**.
4. Approve the config transaction in the wallet.
5. CurvePilot stores only the public config address in local browser storage.
6. Click **Launch via Meteora DBC**.
7. Approve the pool transaction.
8. CurvePilot polls the DBC pool and displays quote-curve progress.

## On-chain recipe

The MVP uses Meteora's market-cap curve builder with:

- SPL token
- 6 base decimals / 9 quote decimals
- immutable token authority
- 1B token supply
- wrapped SOL quote mint
- linear fee scheduler
- configurable starting fee from the UI
- DAMM v2 migration
- 2% fixed migration LP fee option
- 50% partner / 40% creator / 5% partner locked / 5% creator locked LP distribution
- no pool creation fee

The 10% permanent locked LP allocation satisfies the documented locked-liquidity requirement for the basic MVP configuration.

## Devnet only

The default market-cap recipes are intentionally small so the flow can be rehearsed on Devnet:

- AI: 2 → 10 SOL
- RWA: 3 → 15 SOL
- STOCK: 2 → 12 SOL
- COMMUNITY: 1 → 5 SOL
- CUSTOM: 2 → 10 SOL

These are demo defaults, not production economics.

## Security

The browser generates the DBC config Keypair locally and supplies it as a transaction signer. The wallet signs the transaction. CurvePilot does not request or store the wallet private key or seed phrase.

If a config transaction fails, its unused public address can simply be discarded and a new config can be generated.

## Graduation and DAMM v2

Once the DBC curve reaches 100% progress, the UI exposes a **Migrate to DAMM v2** action. The SDK builds the migration transaction and returns the two position-NFT Keypairs required to sign it; the connected wallet signs the transaction. Post-migration DAMM v2 trading UI is still outside the public MVP.
