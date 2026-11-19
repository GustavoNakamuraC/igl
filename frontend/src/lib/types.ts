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

export type GrenadeSide = 'ct' | 'tr' | 'both';
/** Lados que podem ser ligados/desligados no filtro ("both" aparece se algum estiver ligado). */
export type TeamSide = Exclude<GrenadeSide, 'both'>;

export const SIDE_LABELS: Record<GrenadeSide, string> = { ct: 'CT', tr: 'TR', both: 'Ambos' };
export const TEAM_SIDES: TeamSide[] = ['ct', 'tr'];
export const sideColorVar = (s: TeamSide) => `var(--color-side-${s})`;

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
  side: GrenadeSide;
  start: LabeledPoint;
  end: LabeledPoint;
  howTo: string;
  notes: string | null;
  playerIds: string[];
  imageIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GrenadeInput {
  type: GrenadeType;
  side: GrenadeSide;
  start: LabeledPoint;
  end: LabeledPoint;
  howTo: string;
  notes: string | null;
  playerIds: string[];
  imageIds: string[];
}

export type PlayerColor = 'blue' | 'yellow' | 'green' | 'orange' | 'purple';

export const PLAYER_COLORS: { value: PlayerColor; label: string }[] = [
  { value: 'blue', label: 'Azul' },
  { value: 'yellow', label: 'Amarelo' },
  { value: 'green', label: 'Verde' },
  { value: 'orange', label: 'Laranja' },
  { value: 'purple', label: 'Roxo' },
];

export const playerColorVar = (c: PlayerColor) => `var(--color-player-${c})`;

export interface Player {
  id: string;
  name: string;
  /** Função principal. */
  role: string | null;
  /** Função secundária. */
  secondaryRole: string | null;
  notes: string | null;
  color: PlayerColor;
  photoId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerInput {
  name: string;
  role: string | null;
  secondaryRole: string | null;
  notes: string | null;
  color: PlayerColor;
  photoId: string | null;
}

/** Onde um jogador fica num lado, apontando para uma região nomeada do mapa. */
export interface PlayerPosition {
  id: string;
  playerId: string;
  regionId: string;
  side: TeamSide;
  createdAt: string;
}

/** Posição com mapa e nome da região (modal do jogador). */
export interface PlayerPositionView {
  id: string;
  mapSlug: string;
  regionId: string;
  regionName: string;
  side: TeamSide;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  regions: Region[];
  grenades: Grenade[];
  players?: Player[];
  images?: { id: string; contentType: string; data: string }[];
  positions?: PlayerPosition[];
}
