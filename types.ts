
export type WeightType = 'net' | 'gross';
export type MassUnit = 'g' | 'kg';
export type InputMassUnit = 'g' | 'kg';

export interface BoxData {
  weightType: WeightType;
  inputValue: number | ''; // Always in grams
  inputUnit: InputMassUnit; // New field to track the UI selection
  pcsPerMaster: number | '';
  masterTare: number | ''; // Always in grams (default 2000g)
  
  // Inner Carton
  hasInnerCarton: boolean;
  innerCartonsPerMaster: number | '';
  
  // Volume
  calculateVolume: boolean;
  length: number | ''; // cm
  width: number | ''; // cm
  height: number | ''; // cm
}

export interface WeightLevel {
  net: number; // stored in grams
  gross: number; // stored in grams
  pcs: number;
  cbm?: number; // stored in cubic meters
}

export interface HierarchyResults {
  unit: WeightLevel;
  inner?: WeightLevel;
  master: WeightLevel;
}