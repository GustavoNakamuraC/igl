import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findMap } from '../../data/maps';
import { Button } from '../../components/Button';
import { distance, groupByProximity, regionNameAt, type Group } from '../../lib/geometry';
import type { Grenade, Point, Region } from '../../lib/types';
import { anchorStyle, MapCanvas, type MapClick } from './MapCanvas';
import { useRegionStore } from '../regions/regionStore';
import { matchesSide, useGrenadeStore } from '../grenades/grenadeStore';
import { DraftPolygon, RegionLabels, RegionShapes, Vertices } from '../regions/RegionLayer';
import { RegionNameModal } from '../regions/RegionNameModal';
import { RegionPanel } from '../regions/RegionPanel';
import { GrenadeLines, GrenadeMarkers, StartMarkers } from '../grenades/GrenadeLayer';
import { FilterChips } from '../grenades/FilterChips';
import { GrenadeFormModal } from '../grenades/GrenadeFormModal';
import { GrenadeDetailsModal } from '../grenades/GrenadeDetailsModal';
import { LineSelector } from '../line/LineSelector';
import { matchesLine, useLineStore } from '../line/lineStore';

type Mode =
  | { kind: 'view' }
  | { kind: 'drawRegion'; points: Point[]; closed: boolean }
  | { kind: 'editRegion'; region: Region; points: Point[] }
  | { kind: 'newGrenade'; start: Point | null; end: Point | null };

/** Distância em pixels de tela para considerar um clique "no primeiro ponto". */
const CLOSE_PX = 12;

export function MapPage() {
  const { slug } = useParams();
  const map = findMap(slug);

  const regions = useRegionStore((s) => s.regions);
  const showLabels = useRegionStore((s) => s.showLabels);
  const loadRegions = useRegionStore((s) => s.load);
  const createRegion = useRegionStore((s) => s.create);
  const updateRegion = useRegionStore((s) => s.update);

  const grenades = useGrenadeStore((s) => s.grenades);
  const activeTypes = useGrenadeStore((s) => s.activeTypes);
  const activeSides = useGrenadeStore((s) => s.activeSides);
  const loadGrenades = useGrenadeStore((s) => s.load);
  const createGrenade = useGrenadeStore((s) => s.create);
  const updateGrenade = useGrenadeStore((s) => s.update);
  const line = useLineStore((s) => s.ids);

  const [mode, setMode] = useState<Mode>({ kind: 'view' });
  const [cursor, setCursor] = useState<Point | null>(null);
  const [hovered, setHovered] = useState<Group<Grenade> | null>(null);
  const [detailsIds, setDetailsIds] = useState<string[] | null>(null);
  const [editingGrenade, setEditingGrenade] = useState<Grenade | null>(null);
  const [renaming, setRenaming] = useState<Region | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null);
  const [savingShape, setSavingShape] = useState(false);

  useEffect(() => {
    if (!map) return;
    setMode({ kind: 'view' });
    void loadRegions(map.slug).catch(() => {});
    void loadGrenades(map.slug).catch(() => {});
  }, [map, loadRegions, loadGrenades]);

  // Filtros: line ∧ lado ∧ tipo. Cada contador considera a line e o outro filtro (não o próprio),
  // para mostrar quantas apareceriam ao ligar aquele chip.
  const inLine = useMemo(() => grenades.filter((g) => matchesLine(g.playerIds, line)), [grenades, line]);
  const visible = useMemo(
    () => inLine.filter((g) => activeTypes.includes(g.type) && matchesSide(g.side, activeSides)),
    [inLine, activeTypes, activeSides],
  );
  const groups = useMemo(() => groupByProximity(visible, (g) => g.end), [visible]);
  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const g of inLine) if (matchesSide(g.side, activeSides)) acc[g.type] = (acc[g.type] ?? 0) + 1;
    return acc;
  }, [inLine, activeSides]);
  const sideCounts = useMemo(() => {
    const acc: Record<string, number> = { ct: 0, tr: 0 };
    for (const g of inLine) {
      if (!activeTypes.includes(g.type)) continue;
      if (g.side !== 'tr') acc.ct++;
      if (g.side !== 'ct') acc.tr++;
    }
    return acc;
  }, [inLine, activeTypes]);

  // Se o grupo em hover mudou (filtro/edição), descarta a referência antiga.
  useEffect(() => setHovered(null), [groups]);

  const cancelMode = useCallback(() => setMode({ kind: 'view' }), []);
  const anyModalOpen = detailsIds !== null || editingGrenade !== null || renaming !== null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (anyModalOpen) return;
      if ((e.target as HTMLElement).closest('input, textarea')) return;
      if (e.key === 'Escape') cancelMode();
      if (mode.kind === 'drawRegion' && !mode.closed) {
        if (e.key === 'Enter' && mode.points.length >= 3) setMode({ ...mode, closed: true });
        if (e.key === 'Backspace') setMode({ ...mode, points: mode.points.slice(0, -1) });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, anyModalOpen, cancelMode]);

  if (!map) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-muted">Mapa não encontrado.</p>
        <Link to="/" className="text-accent hover:underline">
          Voltar para os mapas
        </Link>
      </div>
    );
  }

  const handleClick = ({ point, pxPerUnit }: MapClick) => {
    if (mode.kind === 'drawRegion' && !mode.closed) {
      const pts = mode.points;
      if (pts.length >= 3 && distance(point, pts[0]) * pxPerUnit < CLOSE_PX) {
        setMode({ ...mode, closed: true });
      } else {
        setMode({ ...mode, points: [...pts, point] });
      }
    } else if (mode.kind === 'newGrenade') {
      if (!mode.start) setMode({ ...mode, start: point });
      else if (!mode.end) setMode({ ...mode, end: point });
    }
  };

  const hint = (() => {
    switch (mode.kind) {
      case 'drawRegion':
        if (mode.closed) return null;
        return mode.points.length < 3
          ? 'Clique no mapa para marcar os pontos da região (mín. 3). Backspace desfaz · Esc cancela'
          : 'Clique no primeiro ponto (ou Enter) para fechar a região · Backspace desfaz · Esc cancela';
      case 'newGrenade':
        if (mode.end) return null;
        return mode.start
          ? '2/2 · Clique onde a granada CAI · Esc cancela'
          : '1/2 · Clique no ponto de onde a granada é ARREMESSADA · Esc cancela';
      case 'editRegion':
        return `Editando “${mode.region.name}”: arraste os vértices · duplo clique remove um vértice`;
      default:
        return null;
    }
  })();

  const crosshair = mode.kind === 'drawRegion' || (mode.kind === 'newGrenade' && !mode.end);
  const editingRegionId = mode.kind === 'editRegion' ? mode.region.id : undefined;
  const linesFor = hovered?.items ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* Barra superior */}
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
        <Link to="/" className="rounded-md px-2 py-1 text-sm text-muted hover:bg-surface-2 hover:text-text" aria-label="Voltar">
          ← Mapas
        </Link>
        <h1 className="text-lg font-bold tracking-wide">{map.name}</h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Link to="/jogadores" className="rounded-md px-2 py-1 text-sm text-muted hover:bg-surface-2 hover:text-text">
            Jogadores
          </Link>
          <Button
            variant="primary"
            active={mode.kind === 'newGrenade'}
            onClick={() => setMode(mode.kind === 'newGrenade' ? { kind: 'view' } : { kind: 'newGrenade', start: null, end: null })}
          >
            + Nova granada
          </Button>
          <Button
            active={mode.kind === 'drawRegion'}
            onClick={() =>
              setMode(mode.kind === 'drawRegion' ? { kind: 'view' } : { kind: 'drawRegion', points: [], closed: false })
            }
          >
            Nomear região
          </Button>
          <Button active={panelOpen} onClick={() => setPanelOpen((v) => !v)}>
            Regiões
          </Button>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border bg-bg-2 px-4 py-2">
        <FilterChips counts={counts} sideCounts={sideCounts} />
        <div className="ml-auto">
          <LineSelector compact />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          <MapCanvas
            map={map}
            cursor={crosshair ? 'crosshair' : undefined}
            onMapClick={handleClick}
            onPointerMoveMap={crosshair ? setCursor : undefined}
            svgLayer={(px) => (
              <>
                <RegionShapes regions={regions} highlightedId={highlightedRegion} hiddenId={editingRegionId} px={px} />
                {mode.kind === 'editRegion' && <DraftPolygon points={mode.points} cursor={null} closed px={px} />}
                {mode.kind === 'drawRegion' && <DraftPolygon points={mode.points} cursor={cursor} closed={mode.closed} px={px} />}
                {mode.kind === 'view' && <GrenadeLines grenades={linesFor} px={px} />}
                {mode.kind === 'newGrenade' && mode.start && (
                  <line
                    x1={mode.start.x}
                    y1={mode.start.y}
                    x2={(mode.end ?? cursor ?? mode.start).x}
                    y2={(mode.end ?? cursor ?? mode.start).y}
                    stroke="var(--color-accent)"
                    strokeWidth={2 * px}
                    strokeDasharray={`${5 * px} ${4 * px}`}
                  />
                )}
              </>
            )}
            htmlLayer={(scale) => (
              <>
                {showLabels && <RegionLabels regions={regions} scale={scale} hiddenId={editingRegionId} />}
                <GrenadeMarkers
                  groups={groups}
                  scale={scale}
                  interactive={mode.kind === 'view'}
                  hovered={hovered}
                  onHover={setHovered}
                  onOpen={(g) => setDetailsIds(g.items.map((i) => i.id))}
                />
                {mode.kind === 'view' && <StartMarkers grenades={linesFor} scale={scale} />}
                {mode.kind === 'drawRegion' && <Vertices points={mode.points} scale={scale} highlightFirst={!mode.closed} />}
                {mode.kind === 'editRegion' && (
                  <Vertices
                    points={mode.points}
                    scale={scale}
                    onMove={(i, p) => setMode((m) => (m.kind === 'editRegion' ? { ...m, points: m.points.map((q, j) => (j === i ? p : q)) } : m))}
                    onRemove={(i) =>
                      setMode((m) => (m.kind === 'editRegion' && m.points.length > 3 ? { ...m, points: m.points.filter((_, j) => j !== i) } : m))
                    }
                  />
                )}
                {mode.kind === 'newGrenade' && mode.start && (
                  <div
                    style={anchorStyle(mode.start, scale)}
                    className="h-3.5 w-3.5 rounded-full border-2 border-black bg-accent"
                  />
                )}
              </>
            )}
          />

          {hint && (
            <div className="pointer-events-none absolute top-3 left-1/2 max-w-[90%] -translate-x-1/2 rounded-full border border-accent/40 bg-surface/95 px-4 py-1.5 text-center text-sm shadow-lg">
              {hint}
            </div>
          )}

          {mode.kind === 'editRegion' && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-lg border border-border bg-surface p-2 shadow-xl">
              <Button variant="ghost" onClick={cancelMode}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                disabled={savingShape}
                onClick={async () => {
                  setSavingShape(true);
                  try {
                    await updateRegion(mode.region.id, { name: mode.region.name, points: mode.points });
                    setMode({ kind: 'view' });
                  } catch {
                    /* erro exibido no banner */
                  } finally {
                    setSavingShape(false);
                  }
                }}
              >
                Salvar forma
              </Button>
            </div>
          )}
        </main>

        {panelOpen && (
          <RegionPanel
            highlightedId={highlightedRegion}
            onHighlight={setHighlightedRegion}
            onRename={setRenaming}
            onEditShape={(r) => setMode({ kind: 'editRegion', region: r, points: r.points })}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>

      {/* Modais */}
      {mode.kind === 'drawRegion' && mode.closed && (
        <RegionNameModal
          title="Nova região"
          onCancel={cancelMode}
          onSave={async (name) => {
            await createRegion({ name, points: mode.points });
            setMode({ kind: 'view' });
          }}
        />
      )}

      {renaming && (
        <RegionNameModal
          title="Renomear região"
          initialName={renaming.name}
          onCancel={() => setRenaming(null)}
          onSave={async (name) => {
            await updateRegion(renaming.id, { name, points: renaming.points });
            setRenaming(null);
          }}
        />
      )}

      {mode.kind === 'newGrenade' && mode.start && mode.end && (
        <GrenadeFormModal
          title="Nova granada"
          initial={{
            type: null,
            start: { ...mode.start, label: regionNameAt(mode.start, regions) },
            end: { ...mode.end, label: regionNameAt(mode.end, regions) },
            howTo: '',
          }}
          onCancel={cancelMode}
          onSave={async (input) => {
            await createGrenade(input);
            setMode({ kind: 'view' });
          }}
        />
      )}

      {detailsIds && !editingGrenade && (
        <GrenadeDetailsModal
          grenadeIds={detailsIds}
          onClose={() => setDetailsIds(null)}
          onEdit={(g) => setEditingGrenade(g)}
        />
      )}

      {editingGrenade && (
        <GrenadeFormModal
          title="Editar granada"
          initial={editingGrenade}
          onCancel={() => setEditingGrenade(null)}
          onSave={async (input) => {
            await updateGrenade(editingGrenade.id, input);
            setEditingGrenade(null);
          }}
        />
      )}
    </div>
  );
}
