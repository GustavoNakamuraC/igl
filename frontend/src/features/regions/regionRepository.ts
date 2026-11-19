import { api } from '../../lib/api';
import type { Region, RegionInput } from '../../lib/types';

export const regionRepository = {
  list: (mapSlug: string) => api<Region[]>(`/maps/${mapSlug}/regions`),
  create: (mapSlug: string, input: RegionInput) =>
    api<Region>(`/maps/${mapSlug}/regions`, { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: RegionInput) =>
    api<Region>(`/regions/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: string) => api<void>(`/regions/${id}`, { method: 'DELETE' }),
};
