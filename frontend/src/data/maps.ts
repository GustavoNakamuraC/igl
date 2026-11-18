export interface GameMap {
  slug: string;
  name: string;
  /** Imagem do radar fornecida pelo usuário (public/maps/<slug>.png). */
  imageUrl: string;
  /** Placeholder usado enquanto a imagem real não existe. */
  placeholderUrl: string;
}

const make = (slug: string, name: string): GameMap => ({
  slug,
  name,
  imageUrl: `/maps/${slug}.png`,
  placeholderUrl: `/maps/${slug}.svg`,
});

export const MAPS: GameMap[] = [
  make('ancient', 'Ancient'),
  make('anubis', 'Anubis'),
  make('cache', 'Cache'),
  make('cobblestone', 'Cobblestone'),
  make('dust2', 'Dust 2'),
  make('inferno', 'Inferno'),
  make('mirage', 'Mirage'),
  make('nuke', 'Nuke'),
];

export function findMap(slug: string | undefined): GameMap | undefined {
  return MAPS.find((m) => m.slug === slug);
}
