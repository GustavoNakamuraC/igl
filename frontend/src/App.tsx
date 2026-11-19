import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './features/maps/HomePage';
import { MapPage } from './features/maps/MapPage';
import { ApiStatusBanner } from './components/ApiStatusBanner';
import { useStatusStore } from './lib/statusStore';
import { PlayersPage } from './features/players/PlayersPage';
import { usePlayerStore } from './features/players/playerStore';
import { useLineStore } from './features/line/lineStore';

export function App() {
  const checkHealth = useStatusStore((s) => s.checkHealth);
  const loadPlayers = usePlayerStore((s) => s.load);
  const players = usePlayerStore((s) => s.players);
  const playersLoaded = usePlayerStore((s) => s.loaded);
  const pruneLine = useLineStore((s) => s.prune);

  useEffect(() => {
    void checkHealth();
    loadPlayers().catch(() => {});
  }, [checkHealth, loadPlayers]);

  // Jogador excluído sai da line salva.
  useEffect(() => {
    if (playersLoaded) pruneLine(players.map((p) => p.id));
  }, [players, playersLoaded, pruneLine]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mapa/:slug" element={<MapPage />} />
        <Route path="/jogadores" element={<PlayersPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <ApiStatusBanner />
    </BrowserRouter>
  );
}
