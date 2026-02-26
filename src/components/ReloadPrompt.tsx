import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function ReloadPrompt() {
  const [closed, setClosed] = useState(false);
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  const dismiss = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setClosed(true);
  };

  useEffect(() => {
    if (!offlineReady || typeof window === 'undefined') {
      return;
    }

    const refreshKey = 'tredeco_sw_post_install_refresh_done';
    if (window.sessionStorage.getItem(refreshKey)) {
      return;
    }

    window.sessionStorage.setItem(refreshKey, 'true');
    window.location.reload();
  }, [offlineReady]);

  if ((closed && !needRefresh) || (!offlineReady && !needRefresh)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-slate-300 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      {offlineReady ? (
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Aplikacja gotowa do pracy offline
        </p>
      ) : null}

      {needRefresh ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Dostępna jest nowa wersja aplikacji.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Odśwież
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Później
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={dismiss}
          className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Zamknij
        </button>
      )}
    </div>
  );
}
