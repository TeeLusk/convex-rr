export type WeightUnit = "oz" | "lb" | "g" | "kg";
export type DimensionUnit = "in" | "ft" | "cm" | "mm" | "m";

export const WEIGHT_UNITS: Array<{ value: WeightUnit; label: string }> = [
  { value: "oz", label: "Ounces (oz)" },
  { value: "lb", label: "Pounds (lb)" },
  { value: "g", label: "Grams (g)" },
  { value: "kg", label: "Kilograms (kg)" },
];

export const DIMENSION_UNITS: Array<{ value: DimensionUnit; label: string }> = [
  { value: "in", label: "Inches (in)" },
  { value: "ft", label: "Feet (ft)" },
  { value: "cm", label: "Centimeters (cm)" },
  { value: "mm", label: "Millimeters (mm)" },
  { value: "m", label: "Meters (m)" },
];

export function convertWeightToOz(weight: number, unit: WeightUnit): number {
  const conversionFactors: Record<WeightUnit, number> = {
    oz: 1,
    lb: 16,
    g: 0.03527396195,
    kg: 35.27396195,
  };
  
  return weight * conversionFactors[unit];
}

export function convertOzToUnit(weightInOz: number, unit: WeightUnit): number {
  const conversionFactors: Record<WeightUnit, number> = {
    oz: 1,
    lb: 0.0625,
    g: 28.349523125,
    kg: 0.028349523125,
  };
  
  return weightInOz * conversionFactors[unit];
}

export function convertDimensionToInches(dimension: number, unit: DimensionUnit): number {
  const conversionFactors: Record<DimensionUnit, number> = {
    in: 1,
    ft: 12,
    cm: 0.393701,
    mm: 0.0393701,
    m: 39.3701,
  };
  
  return dimension * conversionFactors[unit];
}

export function convertInchesToUnit(dimensionInInches: number, unit: DimensionUnit): number {
  const conversionFactors: Record<DimensionUnit, number> = {
    in: 1,
    ft: 0.0833333,
    cm: 2.54,
    mm: 25.4,
    m: 0.0254,
  };
  
  return dimensionInInches * conversionFactors[unit];
}

export function formatWeight(weight: number, unit: WeightUnit): string {
  return `${weight.toFixed(2)} ${unit}`;
}

export function formatDimension(dimension: number, unit: DimensionUnit): string {
  return `${dimension.toFixed(2)} ${unit}`;
}

export function formatDimensions(
  length: number,
  width: number,
  height: number,
  unit: DimensionUnit
): string {
  return `${length.toFixed(2)} × ${width.toFixed(2)} × ${height.toFixed(2)} ${unit}`;
}
