import { CURVE_RECIPES } from "@curvepilot/curve-engine";

export default function Home() {
  return (
    <main style={{maxWidth: 1000, margin: "0 auto", padding: 40, fontFamily: "system-ui"}}>
      <h1>CurvePilot</h1>
      <p>Programmable liquidity launch infrastructure powered by Meteora DBC.</p>

      <h2>Curve Recipes</h2>
      <div style={{display: "grid", gap: 16}}>
        {CURVE_RECIPES.map((recipe) => (
          <article key={recipe.id} style={{border: "1px solid #ddd", borderRadius: 12, padding: 20}}>
            <h3>{recipe.name}</h3>
            <p>{recipe.description}</p>
            <small>
              Asset: {recipe.assetType} · Fee: {recipe.suggestedFeeBps} bps ·
              Graduation: {recipe.graduationQuoteThreshold.toLocaleString()} quote units
            </small>
          </article>
        ))}
      </div>
    </main>
  );
}
