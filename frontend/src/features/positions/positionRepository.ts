import { api } from '../../lib/api';
import type { PlayerPosition, TeamSide } from '../../lib/types';

export const positionRepository = {
  list: (mapSlug: string) => api<PlayerPosition[]>(`/maps/${mapSlug}/positions`),
  create: (input: { playerId: string; regionId: string; side: TeamSide }) =>
    api<PlayerPosition>('/positions', { method: 'POST', body: JSON.stringify(input) }),
  remove: (id: string) => api<void>(`/positions/${id}`, { method: 'DELETE' }),
};
