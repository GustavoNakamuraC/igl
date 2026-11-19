import { api } from '../../lib/api';
import type { BackupData } from '../../lib/types';

export const backupRepository = {
  export: () => api<BackupData>('/backup'),
  import: (data: BackupData) => api<void>('/backup', { method: 'POST', body: JSON.stringify(data) }),
};
