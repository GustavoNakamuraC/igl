import { create } from 'zustand';
import type { PlayerPosition, TeamSide } from '../../lib/types';
import { tracked } from '../../lib/statusStore';
import { positionRepository } from './positionRepository';

interface PositionState {
  mapSlug: string | null;
  positions: PlayerPosition[];
  load: (mapSlug: string) => Promise<void>;
  add: (playerId: string, regionId: string, side: TeamSide) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** A região foi excluída no servidor (cascade): tira as posições dela da memória. */
  forgetRegion: (regionId: string) => void;
}

export const usePositionStore = create<PositionState>((set, get) => ({
  mapSlug: null,
  positions: [],

  load: async (mapSlug) => {
    set({ mapSlug, positions: [] });
    const positions = await tracked(() => positionRepository.list(mapSlug));
    if (get().mapSlug === mapSlug) set({ positions });
  },

  add: async (playerId, regionId, side) => {
    const position = await tracked(() => positionRepository.create({ playerId, regionId, side }));
    set((s) => ({ positions: [...s.positions, position] }));
  },

  remove: async (id) => {
    await tracked(() => positionRepository.remove(id));
    set((s) => ({ positions: s.positions.filter((p) => p.id !== id) }));
  },

  forgetRegion: (regionId) => set((s) => ({ positions: s.positions.filter((p) => p.regionId !== regionId) })),
}));
