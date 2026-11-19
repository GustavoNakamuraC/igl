import { beforeEach, describe, expect, it } from 'vitest';
import { matchesLine, useLineStore, MAX_LINE } from './lineStore';

describe('matchesLine', () => {
  it('line vazia mostra tudo, inclusive granada sem jogador', () => {
    expect(matchesLine([], [])).toBe(true);
    expect(matchesLine(['a'], [])).toBe(true);
  });

  it('com line, mostra só granadas de quem está nela', () => {
    expect(matchesLine(['a', 'b'], ['b'])).toBe(true);
    expect(matchesLine(['a'], ['b', 'c'])).toBe(false);
    expect(matchesLine([], ['b'])).toBe(false);
  });
});

describe('useLineStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useLineStore.getState().clear();
  });

  it('limita a 5 jogadores e persiste', () => {
    const { toggle } = useLineStore.getState();
    ['1', '2', '3', '4', '5', '6'].forEach(toggle);
    expect(useLineStore.getState().ids).toHaveLength(MAX_LINE);
    expect(JSON.parse(localStorage.getItem('igl.line')!)).toEqual(['1', '2', '3', '4', '5']);
    toggle('3');
    expect(useLineStore.getState().ids).toEqual(['1', '2', '4', '5']);
  });

  it('remove jogadores excluídos', () => {
    const { toggle, prune } = useLineStore.getState();
    toggle('a');
    toggle('b');
    prune(['b']);
    expect(useLineStore.getState().ids).toEqual(['b']);
  });
});
