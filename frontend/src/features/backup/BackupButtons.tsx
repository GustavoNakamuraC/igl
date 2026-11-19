import { useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { errorMessage } from '../../lib/api';
import { tracked } from '../../lib/statusStore';
import type { BackupData } from '../../lib/types';
import { backupRepository } from './backupRepository';
import { usePlayerStore } from '../players/playerStore';

export function BackupButtons() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const doExport = async () => {
    try {
      const data = await tracked(() => backupRepository.export());
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `igl-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* erro exibido no banner */
    }
  };

  const onFile = async (file: File) => {
    setMessage(null);
    try {
      const data = JSON.parse(await file.text()) as BackupData;
      if (!Array.isArray(data.regions) || !Array.isArray(data.grenades)) throw new Error('Arquivo não parece um backup do IGL.');
      setPending(data);
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={() => void doExport()}>
        Exportar JSON
      </Button>
      <Button variant="ghost" onClick={() => fileRef.current?.click()}>
        Importar JSON
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        data-testid="import-input"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
          e.target.value = '';
        }}
      />
      {message && <span className="text-sm text-muted">{message}</span>}

      {pending && (
        <Modal
          title="Importar backup"
          onClose={() => setPending(null)}
          width="max-w-md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setPending(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await tracked(() => backupRepository.import(pending));
                    await usePlayerStore.getState().load();
                    setMessage(
                      `Importado: ${pending.regions.length} regiões, ${pending.grenades.length} granadas, ${pending.players?.length ?? 0} jogadores.`,
                    );
                    setPending(null);
                  } catch (e) {
                    setMessage(errorMessage(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Substituir tudo
              </Button>
            </>
          }
        >
          <p className="text-sm">
            O arquivo tem <strong>{pending.regions.length}</strong> regiões, <strong>{pending.grenades.length}</strong> granadas,{' '}
            <strong>{pending.players?.length ?? 0}</strong> jogadores e <strong>{pending.images?.length ?? 0}</strong> imagens.
          </p>
          <p className="mt-2 text-sm text-muted">Todos os dados atuais serão apagados e substituídos pelos do arquivo.</p>
        </Modal>
      )}
    </div>
  );
}
