import { useStatusStore } from '../lib/statusStore';

export function ApiStatusBanner() {
  const error = useStatusStore((s) => s.error);
  const checkHealth = useStatusStore((s) => s.checkHealth);
  if (!error) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[60] flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-lg border border-danger/40 bg-surface px-4 py-2 text-sm shadow-xl"
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-danger" />
      <span className="text-muted">{error}</span>
      <button type="button" onClick={() => void checkHealth()} className="text-accent hover:underline">
        Tentar de novo
      </button>
    </div>
  );
}
