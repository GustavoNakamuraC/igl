import { create } from 'zustand';
import type { Region, RegionInput } from '../../lib/types';
import { tracked } from '../../lib/statusStore';
import { regionRepository } from './regionRepository';

interface RegionState {
  mapSlug: string | null;
  regions: Region[];
  loading: boolean;
  showLabels: boolean;
  load: (mapSlug: string) => Promise<void>;
  create: (input: RegionInput) => Promise<Region>;
  update: (id: string, input: RegionInput) => Promise<Region>;
  remove: (id: string) => Promise<void>;
  toggleLabels: () => void;
}

export const useRegionStore = create<RegionState>((set, get) => ({
  mapSlug: null,
  regions: [],
  loading: false,
  showLabels: true,

  load: async (mapSlug) => {
    set({ mapSlug, regions: [], loading: true });
    try {
      const regions = await tracked(() => regionRepository.list(mapSlug));
      if (get().mapSlug === mapSlug) set({ regions });
    } finally {
      if (get().mapSlug === mapSlug) set({ loading: false });
    }
  },

  create: async (input) => {
    const mapSlug = get().mapSlug!;
    const region = await tracked(() => regionRepository.create(mapSlug, input));
    set((s) => ({ regions: [...s.regions, region] }));
    return region;
  },

  update: async (id, input) => {
    const region = await tracked(() => regionRepository.update(id, input));
    set((s) => ({ regions: s.regions.map((r) => (r.id === id ? region : r)) }));
    return region;
  },

  remove: async (id) => {
    await tracked(() => regionRepository.remove(id));
    set((s) => ({ regions: s.regions.filter((r) => r.id !== id) }));
  },

  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
}));
