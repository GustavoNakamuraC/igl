import { create } from 'zustand';

export const MAX_LINE = 5;
const KEY = 'igl.line';

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.filter((x) => typeof x === 'string').slice(0, MAX_LINE) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* armazenamento indisponível: a line só não fica salva */
  }
}

interface LineState {
  /** Jogadores da line atual. Vazio = mostrar todas as granadas. */
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
  /** Remove da line jogadores que não existem mais. */
  prune: (existing: string[]) => void;
}

export const useLineStore = create<LineState>((set, get) => {
  const update = (ids: string[]) => {
    write(ids);
    set({ ids });
  };
  return {
    ids: read(),
    toggle: (id) => {
      const ids = get().ids;
      if (ids.includes(id)) update(ids.filter((x) => x !== id));
      else if (ids.length < MAX_LINE) update([...ids, id]);
    },
    clear: () => update([]),
    prune: (existing) => {
      const ids = get().ids.filter((id) => existing.includes(id));
      if (ids.length !== get().ids.length) update(ids);
    },
  };
});

/** A granada aparece se não há line, ou se algum jogador da line sabe fazê-la. */
export function matchesLine(playerIds: string[], line: string[]): boolean {
  return line.length === 0 || playerIds.some((id) => line.includes(id));
}
