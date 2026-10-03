"use client";

import { useMemo, useState } from "react";
import { CURVE_RECIPES, AssetType, CurveProfile } from "@curvepilot/curve-engine";

const assets: AssetType[] = ["AI", "RWA", "STOCK", "COMMUNITY", "CUSTOM"];

function curveValue(x: number, profile: CurveProfile, length: number) {
  const t = x / 100;
  const p = profile === "LONG_TAIL" ? Math.pow(t, 2.1) : profile === "CONSERVATIVE" ? Math.pow(t, 0.72) : profile === "BOOTSTRAP" ? Math.pow(t, 1.35) : t;
  return 8 + p * (length - 8);
}

function CurveChart({ profile, length }: { profile: CurveProfile; length: number }) {
  const points = useMemo(() => Array.from({ length: 41 }, (_, i) => {
    const x = (i / 40) * 100;
    const y = curveValue(x, profile, length);
    return `${x},${100 - ((y - 8) / Math.max(1, length - 8)) * 82 - 8}`;
  }).join(" "), [profile, length]);
  return <svg viewBox="0 0 100 100" width="100%" height="280" role="img" aria-label="Curve simulation">
    <line x1="8" y1="92" x2="96" y2="92" stroke="currentColor" opacity=".2" />
    <line x1="8" y1="8" x2="8" y2="92" stroke="currentColor" opacity=".2" />
    <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>;
}

export default function Home() {
  const [asset, setAsset] = useState<AssetType>("AI");
  const initial = CURVE_RECIPES[0];
  const [fee, setFee] = useState(initial.suggestedFeeBps);
  const [graduation, setGraduation] = useState(initial.graduationQuoteThreshold);
  const [length, setLength] = useState(100);
  const [profile, setProfile] = useState<CurveProfile>(initial.profile);
  const selected = CURVE_RECIPES.find((r) => r.assetType === asset) ?? initial;
  function applyRecipe() { setFee(selected.suggestedFeeBps); setGraduation(selected.graduationQuoteThreshold); setProfile(selected.profile); }

  return <main style={{maxWidth:1180,margin:"0 auto",padding:"48px 24px",fontFamily:"system-ui"}}>
    <header style={{marginBottom:36}}><div style={{fontSize:13,letterSpacing:1.5,textTransform:"uppercase",opacity:.65}}>Meteora-powered</div>
      <h1 style={{fontSize:52,lineHeight:1,margin:"10px 0"}}>CurvePilot</h1>
      <p style={{fontSize:19,maxWidth:760,opacity:.75}}>Programmable liquidity launch infrastructure. Turn asset intent into a reusable curve recipe before launching through Meteora DBC.</p>
    </header>
    <section style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1.15fr)",gap:24}}>
      <div style={{border:"1px solid #ddd",borderRadius:18,padding:24}}>
        <h2 style={{marginTop:0}}>1. Asset intent</h2><p style={{opacity:.65}}>Choose what you are launching.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{assets.map((item) => <button key={item} onClick={() => setAsset(item)} style={{padding:"10px 14px",borderRadius:999,border:"1px solid #bbb",background:item===asset?"#111":"transparent",color:item===asset?"#fff":"inherit",cursor:"pointer"}}>{item}</button>)}</div>
        <div style={{marginTop:24,padding:16,borderRadius:14,background:"rgba(127,127,127,.08)"}}><strong>{selected.name}</strong><p style={{marginBottom:8,opacity:.7}}>{selected.description}</p><button onClick={applyRecipe} style={{padding:"10px 14px",borderRadius:10,border:"1px solid #999",cursor:"pointer"}}>Apply recipe</button></div>
        <h2 style={{marginTop:30}}>2. Configure liquidity</h2>
        <label style={{display:"block",marginBottom:18}}>Curve length: <strong>{length}</strong><input type="range" min="20" max="200" value={length} onChange={(e)=>setLength(Number(e.target.value))} style={{display:"block",width:"100%"}} /></label>
        <label style={{display:"block",marginBottom:18}}>Fee: <strong>{fee} bps</strong><input type="range" min="10" max="300" step="5" value={fee} onChange={(e)=>setFee(Number(e.target.value))} style={{display:"block",width:"100%"}} /></label>
        <label style={{display:"block",marginBottom:18}}>Graduation quote threshold: <strong>{graduation.toLocaleString()}</strong><input type="range" min="50000" max="1000000" step="10000" value={graduation} onChange={(e)=>setGraduation(Number(e.target.value))} style={{display:"block",width:"100%"}} /></label>
        <button style={{padding:"13px 16px",borderRadius:11,border:0,background:"#111",color:"#fff",cursor:"pointer"}} onClick={()=>alert("Next: connect wallet and create the Meteora DBC pool.")}>Preview launch</button>
        <div style={{marginTop:8,fontSize:12,opacity:.55}}>Wallet + on-chain DBC launch is the next integration step.</div>
      </div>
      <div style={{border:"1px solid #ddd",borderRadius:18,padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h2 style={{margin:"0 0 4px"}}>Curve Simulator</h2><div style={{opacity:.6}}>Profile: {profile}</div></div><div style={{fontFamily:"monospace",fontSize:12,opacity:.6}}>LIVE PREVIEW</div></div>
        <div style={{marginTop:18,borderRadius:14,background:"rgba(127,127,127,.06)",padding:12}}><CurveChart profile={profile} length={length} /></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:14}}><Metric label="Asset" value={asset}/><Metric label="Fee" value={`${fee} bps`}/><Metric label="Graduation" value={graduation.toLocaleString()}/></div>
      </div>
    </section>
    <footer style={{marginTop:36,opacity:.55,fontSize:13}}>CurvePilot MVP · Meteora Dynamic Bonding Curve integration in progress.</footer>
  </main>;
}

function Metric({label,value}:{label:string;value:string}) { return <div style={{border:"1px solid #ddd",borderRadius:12,padding:12}}><div style={{fontSize:11,textTransform:"uppercase",opacity:.55}}>{label}</div><strong>{value}</strong></div>; }