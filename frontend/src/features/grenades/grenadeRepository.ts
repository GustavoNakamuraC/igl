import { api } from '../../lib/api';
import type { Grenade, GrenadeInput } from '../../lib/types';

export const grenadeRepository = {
  list: (mapSlug: string) => api<Grenade[]>(`/maps/${mapSlug}/grenades`),
  create: (mapSlug: string, input: GrenadeInput) =>
    api<Grenade>(`/maps/${mapSlug}/grenades`, { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: GrenadeInput) =>
    api<Grenade>(`/grenades/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: string) => api<void>(`/grenades/${id}`, { method: 'DELETE' }),
};
