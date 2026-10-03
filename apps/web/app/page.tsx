"use client";

import { useMemo, useState } from "react";
import { CURVE_RECIPES, AssetType, CurveProfile } from "@curvepilot/curve-engine";
import DbcLaunchButton from "../components/DbcLaunchButton";

const assets: AssetType[] = ["AI", "RWA", "STOCK", "COMMUNITY", "CUSTOM"];

const marketCaps: Record<AssetType, { initial: number; migration: number }> = {
  AI: { initial: 2, migration: 10 },
  RWA: { initial: 3, migration: 15 },
  STOCK: { initial: 2, migration: 12 },
  COMMUNITY: { initial: 1, migration: 5 },
  CUSTOM: { initial: 2, migration: 10 },
};

function curveValue(x: number, profile: CurveProfile, length: number) {
  const t = x / 100;
  const p =
    profile === "LONG_TAIL" ? Math.pow(t, 2.1) :
    profile === "CONSERVATIVE" ? Math.pow(t, 0.72) :
    profile === "BOOTSTRAP" ? Math.pow(t, 1.35) : t;
  return 8 + p * (length - 8);
}

function CurveChart({ profile, length }: { profile: CurveProfile; length: number }) {
  const points = useMemo(() => Array.from({ length: 41 }, (_, i) => {
    const x = (i / 40) * 100;
    const y = curveValue(x, profile, length);
    return x + "," + (100 - ((y - 8) / Math.max(1, length - 8)) * 82 - 8);
  }).join(" "), [profile, length]);

  return (
    <svg viewBox="0 0 100 100" width="100%" height="280" role="img" aria-label="Curve simulation">
      <line x1="8" y1="92" x2="96" y2="92" stroke="currentColor" opacity=".2" />
      <line x1="8" y1="8" x2="8" y2="92" stroke="currentColor" opacity=".2" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function Home() {
  const [asset, setAsset] = useState<AssetType>("AI");
  const initial = CURVE_RECIPES[0];
  const [fee, setFee] = useState(initial.suggestedFeeBps);
  const [length, setLength] = useState(100);
  const [profile, setProfile] = useState<CurveProfile>(initial.profile);
  const [intent, setIntent] = useState("AI-native launch with patient price discovery");
  const [intentStatus, setIntentStatus] = useState("");

  const selected = CURVE_RECIPES.find((r) => r.assetType === asset) ?? initial;
  const caps = marketCaps[asset];

  function applyRecipe() {
    setFee(selected.suggestedFeeBps);
    setProfile(selected.profile);
    setIntentStatus("Recipe applied from the selected asset profile.");
  }

  function interpretIntent() {
    const text = intent.toLowerCase();
    const next: AssetType =
      text.includes("rwa") || text.includes("real world") ? "RWA" :
      text.includes("stock") || text.includes("equity") || text.includes("share") ? "STOCK" :
      text.includes("community") || text.includes("meme") ? "COMMUNITY" :
      text.includes("ai") || text.includes("agent") || text.includes("model") ? "AI" : "CUSTOM";
    setAsset(next);
    const recipe = CURVE_RECIPES.find((r) => r.assetType === next) ?? initial;
    setFee(recipe.suggestedFeeBps);
    setProfile(recipe.profile);
    setIntentStatus("Intent mapped to the " + recipe.name + " Curve Recipe.");
  }

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui" }}>
      <header style={{ marginBottom: 30 }}>
        <div style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", opacity: .65 }}>Meteora-powered · Devnet MVP</div>
        <h1 style={{ fontSize: "clamp(40px, 7vw, 64px)", lineHeight: 1, margin: "10px 0" }}>CurvePilot</h1>
        <p style={{ fontSize: 19, maxWidth: 780, opacity: .75 }}>
          Programmable liquidity launch infrastructure. Turn asset intent into a reusable curve recipe, simulate it, then launch through Meteora DBC.
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)", gap: 20 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 18, padding: 22 }}>
          <h2 style={{ marginTop: 0 }}>1. Asset intent</h2>
          <p style={{ opacity: .65 }}>Describe the launch in plain language or choose a profile.</p>

          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            rows={3}
            style={{ width: "100%", boxSizing: "border-box", borderRadius: 12, border: "1px solid #ccc", padding: 12, resize: "vertical" }}
          />
          <button onClick={interpretIntent} style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid #999", cursor: "pointer" }}>
            Interpret intent
          </button>
          {intentStatus && <div style={{ marginTop: 8, fontSize: 12, opacity: .65 }}>{intentStatus}</div>}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
            {assets.map((item) => (
              <button key={item} onClick={() => setAsset(item)} style={{
                padding: "10px 14px", borderRadius: 999, border: "1px solid #bbb",
                background: item === asset ? "#111" : "transparent",
                color: item === asset ? "#fff" : "inherit", cursor: "pointer"
              }}>
                {item}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 18, padding: 16, borderRadius: 14, background: "rgba(127,127,127,.08)" }}>
            <strong>{selected.name}</strong>
            <p style={{ margin: "7px 0 10px", opacity: .7 }}>{selected.description}</p>
            <button onClick={applyRecipe} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #999", cursor: "pointer" }}>
              Apply recipe
            </button>
          </div>

          <h2 style={{ marginTop: 28 }}>2. Configure liquidity</h2>
          <label style={{ display: "block", marginBottom: 18 }}>
            Curve visual length: <strong>{length}</strong>
            <input type="range" min="20" max="200" value={length} onChange={(e) => setLength(Number(e.target.value))} style={{ display: "block", width: "100%" }} />
          </label>
          <label style={{ display: "block", marginBottom: 18 }}>
            Base fee: <strong>{fee} bps</strong>
            <input type="range" min="25" max="300" step="5" value={fee} onChange={(e) => setFee(Number(e.target.value))} style={{ display: "block", width: "100%" }} />
          </label>

          <DbcLaunchButton
            name="CurvePilot Demo"
            symbol="CPILOT"
            uri={(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") + "/metadata/demo.json"}
            feeBps={fee}
            asset={asset}
            initialMarketCap={caps.initial}
            migrationMarketCap={caps.migration}
          />
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 18, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0 }}>Curve Simulator</h2>
              <div style={{ opacity: .6, marginTop: 4 }}>Profile: {profile}</div>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 12, opacity: .6 }}>LIVE PREVIEW</div>
          </div>

          <div style={{ marginTop: 18, borderRadius: 14, background: "rgba(127,127,127,.06)", padding: 12 }}>
            <CurveChart profile={profile} length={length} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 14 }}>
            <Metric label="Asset" value={asset} />
            <Metric label="Fee" value={fee + " bps"} />
            <Metric label="Migration cap" value={caps.migration + " SOL"} />
          </div>

          <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: "rgba(127,127,127,.06)", fontSize: 13, lineHeight: 1.5 }}>
            <strong>Lifecycle</strong>
            <div>Intent → Recipe → Simulation → DBC Config → DBC Pool → Curve Progress → DAMM v2 graduation</div>
            <div style={{ marginTop: 6, opacity: .65 }}>
              The on-chain config uses Meteora's market-cap curve builder. The visual length is a UX simulation control; the selected asset profile determines the live curve recipe.
            </div>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: 28, opacity: .55, fontSize: 12 }}>
        CurvePilot MVP · Devnet-first · Wallet-signed transactions · No private keys stored.
      </footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", opacity: .55 }}>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
