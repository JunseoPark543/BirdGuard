export type BuildingCategoryId =
  | "commercial"
  | "transparent-barrier"
  | "glass-facade"
  | "university"
  | "near-nature"
  | "residential"
  | "special"
  | "other";

export type GenerationMode = "sticker-design" | "building-mockup";

export type BirdGuardStep =
  | "upload"
  | "analyzing"
  | "analysis"
  | "generating"
  | "result";

export type ImageQuality = "good" | "usable" | "poor";
export type WindowSize = "small" | "medium" | "large" | "mixed" | "unknown";
export type VisualLevel = "low" | "medium" | "high" | "unknown";
export type VegetationLevel = "none" | "some" | "dense" | "unknown";
export type BirdCollisionRisk =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type SecondaryCategory = {
  category: BuildingCategoryId;
  confidence: number;
};

export type BuildingAnalysis = {
  schemaVersion: 1;
  isRelevantPhoto: boolean;
  imageQuality: ImageQuality;
  imageQualityReason: string;
  primaryCategory: BuildingCategoryId;
  secondaryCategories: SecondaryCategory[];
  classificationConfidence: number;
  classificationReason: string;
  buildingUse: string;
  windowSize: WindowSize;
  glassReflectivity: VisualLevel;
  nearbyVegetation: VegetationLevel;
  skyReflection: VisualLevel;
  estimatedFloorCount: {
    min: number | null;
    max: number | null;
    explanation: string;
  };
  birdCollisionRisk: BirdCollisionRisk;
  riskFactors: string[];
  environmentTags: string[];
  analyzedEvidence: string[];
  designConsiderations: string[];
  caution: string;
};
