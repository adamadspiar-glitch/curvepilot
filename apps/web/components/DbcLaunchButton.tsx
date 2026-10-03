"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  ActivationType,
  BaseFeeMode,
  buildCurveWithMarketCap,
  CollectFeeMode,
  DAMM_V2_MIGRATION_FEE_ADDRESS,
  DynamicBondingCurveClient,
  MigrationFeeOption,
  MigrationOption,
  TokenAuthorityOption,
  TokenDecimal,
  TokenType,
} from "@meteora-ag/dynamic-bonding-curve-sdk";

const WSOL = new PublicKey("So11111111111111111111111111111111111111112");

export default function DbcLaunchButton({
  name,
  symbol,
  uri,
  feeBps,
  asset,
  initialMarketCap,
  migrationMarketCap,
}: {
  name: string;
  symbol: string;
  uri: string;
  feeBps: number;
  asset: string;
  initialMarketCap: number;
  migrationMarketCap: number;
}) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [configAddress, setConfigAddress] = useState("");
  const [baseMintAddress, setBaseMintAddress] = useState("");
  const [poolAddress, setPoolAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [migrated, setMigrated] = useState(false);
  const [status, setStatus] = useState("");

  const fee = useMemo(() => Math.max(25, feeBps), [feeBps]);

  useEffect(() => {
    const saved = window.localStorage.getItem("curvepilot.dbcConfig");
    if (saved) setConfigAddress(saved);
  }, []);

  useEffect(() => {
    if (!baseMintAddress) return;
    let cancelled = false;
    const client = new DynamicBondingCurveClient(connection, "confirmed");

    const poll = async () => {
      try {
        const pool = await client.state.getPoolByBaseMint(new PublicKey(baseMintAddress));
        if (!pool || cancelled) return;
        if (!cancelled) setPoolAddress(pool.publicKey.toBase58());
        const value = await client.state.getPoolQuoteTokenCurveProgress(pool.publicKey);
        if (!cancelled) {
          setProgress(Math.max(0, Math.min(1, value)));
          setMigrated(Number(pool.account?.poolState?.isMigrated ?? 0) === 1);
        }
      } catch {
        // The pool can take a few seconds to become queryable.
      }
    };

    poll();
    const id = window.setInterval(poll, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [baseMintAddress, connection]);

  async function createConfig() {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      setStatus("Connect a Solana wallet first.");
      return;
    }

    try {
      setStatus("Building a CurvePilot DBC config...");
      setSignature("");
      const client = new DynamicBondingCurveClient(connection, "confirmed");
      const configKeypair = Keypair.generate();

      const curveConfig = buildCurveWithMarketCap({
        token: {
          tokenType: TokenType.SPLToken,
          tokenBaseDecimal: TokenDecimal.SIX,
          tokenQuoteDecimal: TokenDecimal.NINE,
          tokenAuthorityOption: TokenAuthorityOption.Immutable,
          totalTokenSupply: 1_000_000_000,
          leftover: 0,
        },
        fee: {
          baseFeeParams: {
            baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
            feeSchedulerParam: {
              startingFeeBps: fee,
              endingFeeBps: Math.max(25, Math.floor(fee / 2)),
              numberOfPeriod: 0,
              totalDuration: 0,
            },
          },
          dynamicFeeEnabled: true,
          collectFeeMode: CollectFeeMode.QuoteToken,
          creatorTradingFeePercentage: 50,
          poolCreationFee: 0,
          enableFirstSwapWithMinFee: false,
        },
        migration: {
          migrationOption: MigrationOption.MET_DAMM_V2,
          migrationFeeOption: MigrationFeeOption.FixedBps200,
          migrationFee: { feePercentage: 0, creatorFeePercentage: 0 },
        },
        liquidityDistribution: {
          partnerLiquidityPercentage: 50,
          partnerPermanentLockedLiquidityPercentage: 5,
          creatorLiquidityPercentage: 40,
          creatorPermanentLockedLiquidityPercentage: 5,
        },
        lockedVesting: {
          totalLockedVestingAmount: 0,
          numberOfVestingPeriod: 0,
          cliffUnlockAmount: 0,
          totalVestingDuration: 0,
          cliffDurationFromMigrationTime: 0,
        },
        activationType: ActivationType.Timestamp,
        initialMarketCap,
        migrationMarketCap,
      });

      const tx = await client.partner.createConfig({
        config: configKeypair.publicKey,
        feeClaimer: wallet.publicKey,
        leftoverReceiver: wallet.publicKey,
        payer: wallet.publicKey,
        quoteMint: WSOL,
        ...curveConfig,
      });

      const txid = await wallet.sendTransaction(tx, connection, { signers: [configKeypair] });
      await connection.confirmTransaction(txid, "confirmed");
      setConfigAddress(configKeypair.publicKey.toBase58());
      window.localStorage.setItem("curvepilot.dbcConfig", configKeypair.publicKey.toBase58());
      setSignature(txid);
      setStatus("DBC config created. You can now launch a pool with this reusable recipe.");
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "DBC config creation failed.");
    }
  }

  async function launch() {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      setStatus("Connect a Solana wallet first.");
      return;
    }
    if (!configAddress) {
      setStatus("Create a DBC config first.");
      return;
    }

    try {
      setStatus("Building Meteora DBC pool transaction...");
      setSignature("");
      const client = new DynamicBondingCurveClient(connection, "confirmed");
      const baseMint = Keypair.generate();
      const tx = await client.creator.createPool({
        name,
        symbol,
        uri,
        payer: wallet.publicKey,
        poolCreator: wallet.publicKey,
        config: new PublicKey(configAddress),
        baseMint,
      });
      const txid = await wallet.sendTransaction(tx, connection, { signers: [baseMint] });
      await connection.confirmTransaction(txid, "confirmed");
      setBaseMintAddress(baseMint.publicKey.toBase58());
      setSignature(txid);
      setStatus("DBC pool created. Curve progress will update below.");
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "DBC launch failed.");
    }
  }

  async function migrateToDammV2() {
    if (!wallet.publicKey || !wallet.sendTransaction || !poolAddress) {
      setStatus("Connect the wallet and wait for the completed pool to be indexed.");
      return;
    }

    try {
      setStatus("Building DAMM v2 migration transaction...");
      const client = new DynamicBondingCurveClient(connection, "confirmed");
      const result = await client.migration.migrateToDammV2({
        pool: new PublicKey(poolAddress),
        dammConfig: DAMM_V2_MIGRATION_FEE_ADDRESS[3],
        payer: wallet.publicKey,
      });
      const txid = await wallet.sendTransaction(connection ? result.transaction : result.transaction, connection, {
        signers: [result.firstPositionNftKeypair, result.secondPositionNftKeypair],
      });
      await connection.confirmTransaction(txid, "confirmed");
      setSignature(txid);
      setMigrated(true);
      setStatus("DAMM v2 migration transaction confirmed.");
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "DAMM v2 migration failed.");
    }
  }

  const explorer = signature ? "https://explorer.solana.com/tx/" + signature + "?cluster=devnet" : "";
  const progressPct = progress === null ? null : Math.round(progress * 100);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <WalletMultiButton />

      <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 12, opacity: 0.65, textTransform: "uppercase" }}>On-chain setup</div>
        <div style={{ marginTop: 6, fontSize: 13 }}>
          {configAddress ? (
            <>DBC Config: <code style={{ wordBreak: "break-all" }}>{configAddress}</code></>
          ) : (
            <>No CurvePilot DBC config exists in this browser yet.</>
          )}
        </div>
        <button
          onClick={createConfig}
          disabled={!wallet.publicKey}
          style={{ marginTop: 10, padding: "11px 14px", borderRadius: 10, border: "1px solid #999", cursor: wallet.publicKey ? "pointer" : "not-allowed" }}
        >
          {configAddress ? "Create another DBC config" : "1. Create DBC config"}
        </button>
      </div>

      <button
        onClick={launch}
        disabled={!wallet.publicKey || !configAddress}
        style={{
          padding: "13px 16px",
          borderRadius: 11,
          border: 0,
          background: wallet.publicKey && configAddress ? "#111" : "#aaa",
          color: "#fff",
          cursor: wallet.publicKey && configAddress ? "pointer" : "not-allowed",
        }}
      >
        2. Launch via Meteora DBC
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
          <div style={{ opacity: 0.55 }}>Recipe</div>
          <strong>{asset}</strong> · {fee} bps
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
          <div style={{ opacity: 0.55 }}>Migration market cap</div>
          <strong>{migrationMarketCap} SOL</strong>
        </div>
      </div>

      {baseMintAddress && (
        <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14, fontSize: 12 }}>
          <div><strong>Base mint</strong>: <code style={{ wordBreak: "break-all" }}>{baseMintAddress}</code></div>
          {poolAddress && <div style={{ marginTop: 5 }}><strong>DBC pool</strong>: <code style={{ wordBreak: "break-all" }}>{poolAddress}</code></div>}
          <div style={{ marginTop: 8 }}><strong>Curve progress</strong>: {progressPct === null ? "indexing..." : progressPct + "%"}</div>
          <div style={{ height: 8, background: "#eee", borderRadius: 99, overflow: "hidden", marginTop: 7 }}>
            <div style={{ width: (progressPct ?? 0) + "%", height: "100%", background: "#111" }} />
          </div>

          {progressPct !== null && progressPct >= 100 && !migrated && (
            <button
              onClick={migrateToDammV2}
              style={{ marginTop: 12, padding: "11px 14px", borderRadius: 10, border: 0, background: "#111", color: "#fff", cursor: "pointer" }}
            >
              3. Migrate to DAMM v2
            </button>
          )}

          {migrated && <div style={{ marginTop: 10 }}>DAMM v2 migration is marked complete for this pool.</div>}
        </div>
      )}

      {signature && (
        <a href={explorer} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
          View latest transaction on Solana Explorer
        </a>
      )}
      {status && <div style={{ fontSize: 12, wordBreak: "break-word", opacity: 0.72 }}>{status}</div>}
      <div style={{ fontSize: 11, opacity: 0.5 }}>
        Devnet-first. The wallet signs every transaction; CurvePilot never receives or stores your private key.
      </div>
    </div>
  );
}
