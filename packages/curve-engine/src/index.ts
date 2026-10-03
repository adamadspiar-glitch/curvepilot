export type AssetType = "AI" | "RWA" | "STOCK" | "COMMUNITY" | "CUSTOM";
export type CurveProfile = "LONG_TAIL" | "CONSERVATIVE" | "BOOTSTRAP" | "CUSTOM";

export interface CurveRecipe {
  id: string;
  name: string;
  assetType: AssetType;
  profile: CurveProfile;
  description: string;
  suggestedFeeBps: number;
  graduationQuoteThreshold: number;
}

export const CURVE_RECIPES: CurveRecipe[] = [
  {
    id: "ai-long-tail",
    name: "AI Long Tail",
    assetType: "AI",
    profile: "LONG_TAIL",
    description: "A long price-discovery profile for AI-native assets.",
    suggestedFeeBps: 100,
    graduationQuoteThreshold: 250_000
  },
  {
    id: "rwa-conservative",
    name: "RWA Conservative",
    assetType: "RWA",
    profile: "CONSERVATIVE",
    description: "A tighter discovery profile intended for RWA experiments.",
    suggestedFeeBps: 50,
    graduationQuoteThreshold: 500_000
  },
  {
    id: "stock-discovery",
    name: "Stock Discovery",
    assetType: "STOCK",
    profile: "CONSERVATIVE",
    description: "A measured discovery profile for tokenized-equity experiments.",
    suggestedFeeBps: 75,
    graduationQuoteThreshold: 350_000
  },
  {
    id: "community-bootstrap",
    name: "Community Bootstrap",
    assetType: "COMMUNITY",
    profile: "BOOTSTRAP",
    description: "A configurable community-launch profile.",
    suggestedFeeBps: 100,
    graduationQuoteThreshold: 100_000
  },
  {
    id: "custom-experimental",
    name: "Custom Experimental",
    assetType: "CUSTOM",
    profile: "CUSTOM",
    description: "A neutral starting recipe for fully custom launch experiments.",
    suggestedFeeBps: 100,
    graduationQuoteThreshold: 250_000
  }
];

export function findRecipe(assetType: AssetType): CurveRecipe {
  return (
    CURVE_RECIPES.find((recipe) => recipe.assetType === assetType) ??
    CURVE_RECIPES[0]
  );
}
