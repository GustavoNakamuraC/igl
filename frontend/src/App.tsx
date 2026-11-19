import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './features/maps/HomePage';
import { MapPage } from './features/maps/MapPage';
import { ApiStatusBanner } from './components/ApiStatusBanner';
import { useStatusStore } from './lib/statusStore';

export function App() {
  const checkHealth = useStatusStore((s) => s.checkHealth);
  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mapa/:slug" element={<MapPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <ApiStatusBanner />
    </BrowserRouter>
  );
}
