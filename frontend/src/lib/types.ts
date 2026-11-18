export interface Point {
  x: number;
  y: number;
}

export type GrenadeType = 'smoke' | 'molotov' | 'flash' | 'he';

export const GRENADE_TYPES: GrenadeType[] = ['smoke', 'molotov', 'flash', 'he'];

export const GRENADE_LABELS: Record<GrenadeType, string> = {
  smoke: 'Smoke',
  molotov: 'Molotov',
  flash: 'Flash',
  he: 'HE',
};

export interface Region {
  id: string;
  mapSlug: string;
  name: string;
  points: Point[];
  createdAt: string;
  updatedAt: string;
}

export interface RegionInput {
  name: string;
  points: Point[];
}

export interface LabeledPoint extends Point {
  label: string | null;
}

export interface Grenade {
  id: string;
  mapSlug: string;
  type: GrenadeType;
  start: LabeledPoint;
  end: LabeledPoint;
  howTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrenadeInput {
  type: GrenadeType;
  start: LabeledPoint;
  end: LabeledPoint;
  howTo: string;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  regions: Region[];
  grenades: Grenade[];
}
