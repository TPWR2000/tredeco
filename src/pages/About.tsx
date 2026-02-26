import { ArrowLeft, CheckCircle, Compass, Grid3X3, RefreshCcw, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  TREDECO_WEEKDAYS_SHORT,
  getStartWeekdayOfMarch1st,
  getTredecoWeekdayIndex,
  gregorianToTredeco,
  isTredecoLeapYear,
} from '../logic/tredecoEngine';

export function About() {
  const { offlineReady: [offlineReady], needRefresh: [needRefresh] } = useRegisterSW({
    immediate: true,
  });
  const supportsSW = useMemo(
    () => typeof window !== 'undefined' && 'serviceWorker' in navigator,
    []
  );
  const [progress, setProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncDetails, setShowSyncDetails] = useState(false);
  const [isStalled, setIsStalled] = useState(false);
  const lastProgressChangeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!supportsSW || !offlineReady) {
      return;
    }

    setProgress(100);
    setIsSyncing(false);
    setIsStalled(false);
  }, [offlineReady, supportsSW]);

  useEffect(() => {
    if (supportsSW && !offlineReady) {
      setIsSyncing(true);
    }
  }, [offlineReady, supportsSW]);

  useEffect(() => {
    if (!supportsSW || offlineReady) {
      return;
    }

    let isMounted = true;
    const listeners: Array<() => void> = [];

    const updateProgress = (value: number) => {
      if (!isMounted) {
        return;
      }

      setProgress((prev) => {
        if (value > prev) {
          lastProgressChangeRef.current = Date.now();
          setIsStalled(false);
          return value;
        }

        return prev;
      });
    };

    const attachWorker = (worker?: ServiceWorker | null) => {
      if (!worker) {
        return;
      }

      setIsSyncing(true);

      const updateByState = () => {
        switch (worker.state) {
          case 'installing':
            updateProgress(20);
            break;
          case 'installed':
            updateProgress(60);
            break;
          case 'activating':
            updateProgress(85);
            break;
          case 'activated':
            updateProgress(100);
            setIsSyncing(false);
            break;
          default:
            break;
        }
      };

      updateByState();
      const stateHandler = () => updateByState();
      worker.addEventListener('statechange', stateHandler);
      listeners.push(() => worker.removeEventListener('statechange', stateHandler));
    };

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (!isMounted || !registration) {
          return;
        }

        attachWorker(registration.installing ?? registration.waiting ?? registration.active);
        const updateFoundHandler = () => attachWorker(registration.installing);
        registration.addEventListener('updatefound', updateFoundHandler);
        listeners.push(() => registration.removeEventListener('updatefound', updateFoundHandler));
      })
      .catch(() => {
        setIsSyncing(false);
      });

    const stallInterval = window.setInterval(() => {
      if (offlineReady || progress >= 100) {
        return;
      }

      if (Date.now() - lastProgressChangeRef.current > 30_000) {
        setIsStalled(true);
      }
    }, 1_000);

    return () => {
      isMounted = false;
      window.clearInterval(stallInterval);
      listeners.forEach((cleanup) => cleanup());
    };
  }, [offlineReady, progress, supportsSW]);

  console.log('PWA State:', { offlineReady, needRefresh });

  const forceReload = () => {
    (window.location.reload as unknown as (forcedReload?: boolean) => void)(true);
  };

  const showSyncIndicator = supportsSW;
  const showSpinner = (needRefresh || !offlineReady) && isSyncing && progress < 100;
  const progressStrokeOffset = 50 - (Math.min(Math.max(progress, 0), 100) / 100) * 50;

  const now = useMemo(() => new Date(), []);
  const nowTredeco = useMemo(() => gregorianToTredeco(now), [now]);
  const [simYear, setSimYear] = useState<number>(nowTredeco.year);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateYearChange = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimYear((prev) => prev + 1);
      setIsSimulating(false);
    }, 600);
  };

  const startWeekday = getStartWeekdayOfMarch1st(simYear);
  const hasBix = isTredecoLeapYear(simYear);

  return (
    <article className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
          O systemie
        </p>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Tredeco: Geometria Czasu
        </h2>
        <p className="max-w-3xl text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          Tredeco to nowoczesna odpowiedź na archaiczne podziały czasu. Podczas gdy kalendarz gregoriański jest efektem wielowiekowych kompromisów religijnych i błędów cesarzy, Tredeco oferuje matematyczną czystość: 13 równych miesięcy po 28 dni. System ten przywraca 1 marca jako naturalny punkt startowy roku, synchronizując rytm życia z budzącą się naturą.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-2 inline-flex items-center gap-2 text-xl font-semibold">
            <Compass size={18} className="text-emerald-600 dark:text-emerald-300" />
            Filozofia Tredeco
          </p>
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">
            Celem systemu jest odejście od przypadkowości długości miesięcy i przejście do
            rytmu, który można intuicyjnie zapamiętać. Każdy miesiąc jest identyczny, a czas
            staje się przewidywalny i łatwy do planowania.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-2 inline-flex items-center gap-2 text-xl font-semibold">
            <Grid3X3 size={18} className="text-emerald-600 dark:text-emerald-300" />
            Geometria Czasu
          </p>
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">
            Tredeco działa według zasady „1 na rogu”: każdy miesiąc ma stałą siatkę 4×7.
            Dzięki pływającemu tygodniowi daty zachowują przewidywalną geometrię,
            a ich pozycja w miesiącu jest logiczna i powtarzalna.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold tracking-tight">Porównanie systemów</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700">
          <table className="w-full table-fixed border-collapse text-left">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Cecha
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-300">
                  System Gregoriański
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                  System Tredeco
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3 font-medium">Dni w miesiącu</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">28-31 dni</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Stałe 28 dni</td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3 font-medium">Pozycja dat w miesiącu</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  Zmienne dni tygodnia dla tych samych dat
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  Przewidywalna lokalizacja daty
                </td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3 font-medium">Struktura wizualna</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  Brak stałej geometrii
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  Idealny kwadrat 4×7
                </td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3 font-medium">Logika nazw</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  Myląca (np. October – „ósmy” z j. angielskiego – jest dziesiąty)
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  Precyzyjna (Primo to 1., Tredeco to 13.)
                </td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3 font-medium">Geneza</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  Dekrety papieskie i rzymskie przesądy
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  Geometria i biorytm człowieka
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold tracking-tight">Dni Synchronizacji</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Nilo</p>
            <p className="text-slate-700 dark:text-slate-300">
              Inspirowany ideą dni epagomenalnych ze starożytnego Egiptu. To 365. dzień roku, który nie należy do żadnego miesiąca. To moment pauzy przed nowym cyklem Primo.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <RefreshCcw size={16} className="text-emerald-600 dark:text-emerald-300" />
              Bix
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Współczesna forma rzymskiego bissextus. Gwarantuje, że Twoje 1 Primo zawsze będzie pachnieć wiosną, niezależnie od upływu wieków.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold tracking-tight">Dlaczego Dualizm Czasu ma sens?</h3>
        <div className="rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-950/30">
          <p className="leading-relaxed text-slate-800 dark:text-slate-200">
            Korzystanie z Tredeco równolegle z kalendarzem gregoriańskim to nie tylko ciekawostka – to <strong>narzędzie higieny mentalnej</strong>.
          </p>
          <ul className="mt-4 space-y-3 text-slate-700 dark:text-slate-300">
            <li className="flex gap-3">
              <span className="font-bold text-emerald-600">1.</span>
              <span><strong>Oddzielenie pracy od życia:</strong> Używaj gregoriańskiego do terminów urzędowych, a Tredeco do planowania pasji, treningów i nawyków. Stałe 28-dniowe bloki idealnie budują dyscyplinę.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-emerald-600">2.</span>
              <span><strong>Zrozumienie biorytmu:</strong> Tredeco jest bliskie cyklom księżycowym i hormonalnym. Śledząc czas w ten sposób, szybciej zauważysz naturalne wahania swojej energii.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-emerald-600">3.</span>
              <span><strong>Ucieczka przed „chaosem miesięcy”:</strong> Gdy świat dziwi się, że luty znów minął za szybko, Ty zachowujesz spokój – w Tredeco każdy miesiąc ma tę samą wagę.</span>
            </li>
          </ul>
        </div>
      </section>

      <footer className="flex items-center justify-between gap-4">
        <Link
          to="/kalendarz"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
          Wróć do kalendarza
        </Link>

        {showSyncIndicator ? (
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSyncDetails((prev) => !prev)}
              className="inline-flex items-center"
              title="Zasoby Tredeco zsynchronizowane lokalnie"
              aria-label="Status synchronizacji offline"
            >
              {offlineReady ? (
                <CheckCircle className="block h-4 w-4 text-green-500" />
              ) : (
                <span className="relative block h-5 w-5">
                  <svg className="absolute inset-0 h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      className="fill-none stroke-slate-300 dark:stroke-slate-700"
                      strokeWidth="2"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      className="fill-none stroke-emerald-500 transition-all duration-300"
                      strokeWidth="2"
                      strokeDasharray="50"
                      strokeDashoffset={progressStrokeOffset}
                    />
                  </svg>
                  <RefreshCw
                    className={`absolute inset-[2px] block h-4 w-4 text-gray-400 opacity-50 ${
                      showSpinner ? 'animate-spin' : ''
                    }`}
                  />
                </span>
              )}
            </button>

            {showSyncDetails ? (
              <div className="rounded-lg border border-slate-300 bg-white/95 px-2 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200">
                Synchronizacja: {Math.round(progress)}%
                {isStalled ? (
                  <div className="mt-1 flex items-center gap-2">
                    <span>Wykryto problem z połączeniem. Spróbuj odświeżyć stronę</span>
                    <button
                      type="button"
                      onClick={forceReload}
                      className="rounded-md border border-slate-300 px-2 py-0.5 text-[11px] font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                    >
                      Wymuś odświeżenie
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </footer>
    </article>
  );
}
