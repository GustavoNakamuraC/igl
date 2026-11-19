import { api } from '../../lib/api';
import type { Player, PlayerInput } from '../../lib/types';

export const playerRepository = {
  list: () => api<Player[]>('/players'),
  create: (input: PlayerInput) => api<Player>('/players', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: PlayerInput) =>
    api<Player>(`/players/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: string) => api<void>(`/players/${id}`, { method: 'DELETE' }),
};
