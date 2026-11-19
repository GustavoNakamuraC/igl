import { create } from 'zustand';
import type { Player, PlayerInput } from '../../lib/types';
import { tracked } from '../../lib/statusStore';
import { playerRepository } from './playerRepository';

interface PlayerState {
  players: Player[];
  loaded: boolean;
  load: () => Promise<void>;
  create: (input: PlayerInput) => Promise<Player>;
  update: (id: string, input: PlayerInput) => Promise<Player>;
  remove: (id: string) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  players: [],
  loaded: false,

  load: async () => {
    const players = await tracked(() => playerRepository.list());
    set({ players, loaded: true });
  },

  create: async (input) => {
    const player = await tracked(() => playerRepository.create(input));
    set((s) => ({ players: [...s.players, player] }));
    return player;
  },

  update: async (id, input) => {
    const player = await tracked(() => playerRepository.update(id, input));
    set((s) => ({ players: s.players.map((p) => (p.id === id ? player : p)) }));
    return player;
  },

  remove: async (id) => {
    await tracked(() => playerRepository.remove(id));
    set((s) => ({ players: s.players.filter((p) => p.id !== id) }));
  },
}));
