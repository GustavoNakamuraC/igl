import { Link } from 'react-router-dom';
import { MAPS, type GameMap } from '../../data/maps';
import { MapImage } from '../../components/MapImage';
import { BackupButtons } from '../backup/BackupButtons';

function MapCard({ map }: { map: GameMap }) {
  return (
    <Link
      to={`/mapa/${map.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-border bg-surface transition duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-[0_10px_30px_-10px_rgba(245,166,35,0.35)]"
    >
      <div className="relative aspect-square overflow-hidden bg-bg-2">
        <MapImage map={map} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <img
          src="/brand/cs2.svg"
          alt=""
          aria-hidden="true"
          className="absolute top-3 right-3 h-9 w-9 opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 px-4 py-3">
        <h2 className="text-lg font-bold tracking-wide">{map.name}</h2>
      </div>
    </Link>
  );
}

export function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-accent">IGL</span> · Mapas
          </h1>
          <p className="mt-1 text-sm text-muted">Escolha um mapa para ver regiões e granadas.</p>
        </div>
        <BackupButtons />
      </header>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {MAPS.map((m) => (
          <MapCard key={m.slug} map={m} />
        ))}
      </div>
    </div>
  );
}
