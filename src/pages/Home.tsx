import {
  Compass,
  LocateFixed,
  MapPin,
  Moon,
  MoonStar,
  Navigation,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as SunCalc from 'suncalc';
import {
  getStartWeekdayOfMarch1st,
  getTredecoWeekday,
  gregorianToTredeco,
} from '../logic/tredecoEngine';

type AstronomyData = {
  sunrise: Date;
  sunset: Date;
  moonrise: Date | null;
  moonset: Date | null;
  moonPhase: string;
};

type CityLocation = {
  label: string;
  latitude: number;
  longitude: number;
};

type StoredLocation = {
  latitude: number;
  longitude: number;
  label?: string;
};

const CITY_OPTIONS: Record<string, CityLocation> = {
  warszawa: { label: 'Warszawa', latitude: 52.2297, longitude: 21.0122 },
  krakow: { label: 'Kraków', latitude: 50.0647, longitude: 19.945 },
  gdansk: { label: 'Gdańsk', latitude: 54.352, longitude: 18.6466 },
  wroclaw: { label: 'Wrocław', latitude: 51.1079, longitude: 17.0385 },
  poznan: { label: 'Poznań', latitude: 52.4064, longitude: 16.9252 },
};

function getStoredLocation(): StoredLocation | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem('tredeco_location');
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredLocation>;
    if (
      typeof parsed.latitude === 'number' &&
      Number.isFinite(parsed.latitude) &&
      typeof parsed.longitude === 'number' &&
      Number.isFinite(parsed.longitude)
    ) {
      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        label: typeof parsed.label === 'string' ? parsed.label : undefined,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function saveLocationToStorage(location: StoredLocation): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('tredeco_location', JSON.stringify(location));
}

function clearLocationStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('tredeco_location');
}

function formatTime(value: Date | null): string {
  if (!value) {
    return 'Brak danych';
  }
  return format(value, 'HH:mm');
}

function getMoonPhaseLabel(phase: number): string {
  if (phase < 0.03 || phase >= 0.97) return 'Nów';
  if (phase < 0.22) return 'Przybywający sierp';
  if (phase < 0.28) return 'Pierwsza kwadra';
  if (phase < 0.47) return 'Przybywający garb';
  if (phase < 0.53) return 'Pełnia';
  if (phase < 0.72) return 'Ubywający garb';
  if (phase < 0.78) return 'Ostatnia kwadra';
  return 'Ubywający sierp';
}

function resolveTredecoDisplay(date: Date): string {
  const tredeco = gregorianToTredeco(date);
  if (tredeco.isNilo) {
    return 'Nilo';
  }
  if (tredeco.isBix) {
    return 'Bix';
  }
  return `${tredeco.day} ${tredeco.month}`;
}

export function Home() {
  const now = useMemo(() => new Date(), []);
  const tredecoData = useMemo(() => gregorianToTredeco(now), [now]);
  const tredecoDate = useMemo(() => resolveTredecoDisplay(now), [now]);
  const tredecoWeekday = useMemo(() => {
    if (tredecoData.isNilo || tredecoData.isBix) {
      return 'Poza tygodniem';
    }

    const startWeekday = getStartWeekdayOfMarch1st(tredecoData.year);
    return getTredecoWeekday(tredecoData.day, startWeekday).toLocaleLowerCase('pl-PL');
  }, [tredecoData]);

  const gregorianDate = useMemo(
    () => format(now, 'd MMMM yyyy', { locale: pl }),
    [now]
  );

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(() => {
    const stored = getStoredLocation();
    return stored ? { latitude: stored.latitude, longitude: stored.longitude } : null;
  });
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [selectedCity, setSelectedCity] = useState<keyof typeof CITY_OPTIONS>('warszawa');
  const [locationLabel, setLocationLabel] = useState<string | null>(() => {
    const stored = getStoredLocation();
    return stored?.label ?? null;
  });
  const requestGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolokalizacja jest niedostępna. Możesz podać lokalizację ręcznie.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gpsLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'Twoja lokalizacja',
        };
        setGeoError(null);
        setCoords({
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
        });
        setLocationLabel(gpsLocation.label);
        setShowManualLocation(false);
        saveLocationToStorage(gpsLocation);
      },
      (error) => {
        setGeoError(
          error.message ||
            'Nie udało się pobrać lokalizacji (np. brak HTTPS lub brak zgody użytkownika).'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  const useGpsLocation = useCallback(() => {
    clearLocationStorage();
    setGeoError(null);
    setCoords(null);
    setLocationLabel(null);
    requestGpsLocation();
  }, [requestGpsLocation]);

  useEffect(() => {
    if (coords) {
      return;
    }

    requestGpsLocation();
  }, [coords, requestGpsLocation]);

  useEffect(() => {
    if (!coords) {
      return;
    }

    saveLocationToStorage({
      latitude: coords.latitude,
      longitude: coords.longitude,
      label: locationLabel ?? undefined,
    });
  }, [coords, locationLabel]);

  const applyManualLocation = () => {
    const city = CITY_OPTIONS[selectedCity];
    const manualLocation = {
      latitude: city.latitude,
      longitude: city.longitude,
      label: city.label,
    };
    setCoords({ latitude: manualLocation.latitude, longitude: manualLocation.longitude });
    setLocationLabel(city.label);
    saveLocationToStorage(manualLocation);
    setGeoError(null);
    setShowManualLocation(false);
  };

  const astronomyData = useMemo<AstronomyData | null>(() => {
    if (!coords) {
      return null;
    }

    const currentDate = new Date();
    const sunTimes = SunCalc.getTimes(currentDate, coords.latitude, coords.longitude);
    const moonTimes = SunCalc.getMoonTimes(currentDate, coords.latitude, coords.longitude);
    const moonIllumination = SunCalc.getMoonIllumination(currentDate);

    return {
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset,
      moonrise: moonTimes.rise ?? null,
      moonset: moonTimes.set ?? null,
      moonPhase: getMoonPhaseLabel(moonIllumination.phase),
    };
  }, [coords]);

  const hasLocation = Boolean(coords);
  const showGeoError = Boolean(geoError) && !hasLocation;

  return (
    <section className="space-y-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-xl shadow-slate-300/30 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
          Dzisiejsza data Tredeco
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
          {tredecoDate}
        </h2>
        <p className="mt-2 text-lg font-medium text-slate-800 dark:text-slate-100">
          rok {tredecoData.year}
        </p>
        <p className="mt-1 text-base text-slate-700 dark:text-slate-200">{tredecoWeekday}</p>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{gregorianDate}</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Compass className="text-emerald-600 dark:text-emerald-300" size={20} />
          <h3 className="text-2xl font-semibold tracking-tight">Astronomia</h3>
          {hasLocation && !showManualLocation ? (
            <>
              <span className="ml-1 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <MapPin size={14} />
                {locationLabel ?? 'Wybrana lokalizacja'}
              </span>
              <button
                type="button"
                onClick={() => setShowManualLocation(true)}
                className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
              >
                Zmień
              </button>
              <button
                type="button"
                onClick={useGpsLocation}
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
              >
                <LocateFixed size={14} />
                Użyj GPS
              </button>
            </>
          ) : null}
        </div>

        {!hasLocation ? (
          <>
            <p className="rounded-xl border border-slate-300 bg-white/70 px-4 py-3 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
              Dane astronomiczne wymagają lokalizacji użytkownika (GPS lub wybór miasta).
            </p>

            {showGeoError ? (
              <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-100/60 px-4 py-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                <p>{geoError}</p>
                <button
                  type="button"
                  onClick={() => setShowManualLocation((current) => !current)}
                  className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-500"
                >
                  Wprowadź lokalizację ręcznie
                </button>
                <button
                  type="button"
                  onClick={useGpsLocation}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-500 px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200/70 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/30"
                >
                  <LocateFixed size={15} />
                  Użyj GPS
                </button>
              </div>
            ) : null}

            {showManualLocation ? (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:max-w-sm">
                <label className="text-sm text-slate-600 dark:text-slate-300">
                  Wybierz miasto
                </label>
                <select
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value as keyof typeof CITY_OPTIONS)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                >
                  {Object.entries(CITY_OPTIONS).map(([key, city]) => (
                    <option key={key} value={key}>
                      {city.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={applyManualLocation}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Zastosuj lokalizację
                </button>
              </div>
            ) : null}

            {!showGeoError ? (
              <p className="rounded-xl border border-slate-300 bg-white/70 px-4 py-3 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                Pobieranie geolokalizacji i danych astronomicznych...
              </p>
            ) : null}
          </>
        ) : null}

        {hasLocation && showManualLocation ? (
          <div className="flex flex-col gap-2 rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:max-w-sm">
            <label className="text-sm text-slate-600 dark:text-slate-300">
              Wybierz miasto
            </label>
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value as keyof typeof CITY_OPTIONS)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            >
              {Object.entries(CITY_OPTIONS).map(([key, city]) => (
                <option key={key} value={key}>
                  {city.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyManualLocation}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Zastosuj lokalizację
              </button>
              <button
                type="button"
                onClick={() => setShowManualLocation(false)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : null}

        {astronomyData ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-1 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Sunrise size={16} /> Wschód słońca
              </p>
              <p className="text-xl font-semibold">{formatTime(astronomyData.sunrise)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-1 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Sunset size={16} /> Zachód słońca
              </p>
              <p className="text-xl font-semibold">{formatTime(astronomyData.sunset)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-1 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Navigation size={16} /> Wschód księżyca
              </p>
              <p className="text-xl font-semibold">{formatTime(astronomyData.moonrise)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-1 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Navigation className="rotate-180" size={16} /> Zachód księżyca
              </p>
              <p className="text-xl font-semibold">{formatTime(astronomyData.moonset)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:col-span-2 lg:col-span-1">
              <p className="mb-1 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <MoonStar size={16} /> Faza księżyca
              </p>
              <p className="text-xl font-semibold">{astronomyData.moonPhase}</p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                <Moon className="inline-block" size={16} /> Dane lokalne na podstawie geolokalizacji.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
