import { describe, expect, it } from 'vitest';
import { matchesSide } from './grenadeStore';

describe('matchesSide', () => {
  it('CT e TR só aparecem com o próprio lado ligado', () => {
    expect(matchesSide('ct', ['ct', 'tr'])).toBe(true);
    expect(matchesSide('ct', ['tr'])).toBe(false);
    expect(matchesSide('tr', ['tr'])).toBe(true);
  });

  it('Ambos aparece com qualquer lado ligado, e some com os dois desligados', () => {
    expect(matchesSide('both', ['ct'])).toBe(true);
    expect(matchesSide('both', ['tr'])).toBe(true);
    expect(matchesSide('both', [])).toBe(false);
  });
});
