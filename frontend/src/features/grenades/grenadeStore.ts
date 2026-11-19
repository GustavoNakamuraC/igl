import { create } from 'zustand';
import { GRENADE_TYPES, type Grenade, type GrenadeInput, type GrenadeType } from '../../lib/types';
import { tracked } from '../../lib/statusStore';
import { grenadeRepository } from './grenadeRepository';

interface GrenadeState {
  mapSlug: string | null;
  grenades: Grenade[];
  loading: boolean;
  /** Tipos visíveis no mapa. Padrão: todos. */
  activeTypes: GrenadeType[];
  load: (mapSlug: string) => Promise<void>;
  create: (input: GrenadeInput) => Promise<Grenade>;
  update: (id: string, input: GrenadeInput) => Promise<Grenade>;
  remove: (id: string) => Promise<void>;
  toggleType: (type: GrenadeType) => void;
  onlyType: (type: GrenadeType) => void;
  allTypes: () => void;
}

export const useGrenadeStore = create<GrenadeState>((set, get) => ({
  mapSlug: null,
  grenades: [],
  loading: false,
  activeTypes: [...GRENADE_TYPES],

  load: async (mapSlug) => {
    set({ mapSlug, grenades: [], loading: true });
    try {
      const grenades = await tracked(() => grenadeRepository.list(mapSlug));
      if (get().mapSlug === mapSlug) set({ grenades });
    } finally {
      if (get().mapSlug === mapSlug) set({ loading: false });
    }
  },

  create: async (input) => {
    const mapSlug = get().mapSlug!;
    const grenade = await tracked(() => grenadeRepository.create(mapSlug, input));
    set((s) => ({ grenades: [...s.grenades, grenade] }));
    return grenade;
  },

  update: async (id, input) => {
    const grenade = await tracked(() => grenadeRepository.update(id, input));
    set((s) => ({ grenades: s.grenades.map((g) => (g.id === id ? grenade : g)) }));
    return grenade;
  },

  remove: async (id) => {
    await tracked(() => grenadeRepository.remove(id));
    set((s) => ({ grenades: s.grenades.filter((g) => g.id !== id) }));
  },

  toggleType: (type) =>
    set((s) => ({
      activeTypes: s.activeTypes.includes(type) ? s.activeTypes.filter((t) => t !== type) : [...s.activeTypes, type],
    })),
  onlyType: (type) => set({ activeTypes: [type] }),
  allTypes: () => set({ activeTypes: [...GRENADE_TYPES] }),
}));
