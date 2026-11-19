import { create } from 'zustand';
import { api, errorMessage } from './api';

interface StatusState {
  /** Último erro de comunicação com o backend (exibido no banner). */
  error: string | null;
  setError: (message: string | null) => void;
  checkHealth: () => Promise<void>;
}

export const useStatusStore = create<StatusState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  checkHealth: async () => {
    try {
      await api('/actuator/health');
      set({ error: null });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },
}));

/** Executa uma chamada e, se falhar, registra o erro no banner e repassa a exceção. */
export async function tracked<T>(fn: () => Promise<T>): Promise<T> {
  try {
    const result = await fn();
    useStatusStore.getState().setError(null);
    return result;
  } catch (e) {
    useStatusStore.getState().setError(errorMessage(e));
    throw e;
  }
}
