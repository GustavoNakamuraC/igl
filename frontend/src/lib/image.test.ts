import { describe, expect, it } from 'vitest';
import { fitWithin } from './image';

describe('fitWithin', () => {
  it('reduz pelo maior lado mantendo a proporção', () => {
    expect(fitWithin(3200, 1800, 1600)).toEqual({ width: 1600, height: 900 });
    expect(fitWithin(1000, 2000, 512)).toEqual({ width: 256, height: 512 });
  });

  it('não aumenta imagens pequenas', () => {
    expect(fitWithin(300, 200, 512)).toEqual({ width: 300, height: 200 });
  });
});
