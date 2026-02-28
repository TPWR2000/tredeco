import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import {
  TREDECO_MONTHS,
  getStartWeekdayOfMarch1st,
  getTredecoWeekday,
  gregorianToTredeco,
  isTredecoLeapYear,
  tredecoToGregorian,
} from '../logic/tredecoEngine';

type ConverterMode = 'gregorianToTredeco' | 'tredecoToGregorian';

const GREGORIAN_MONTHS = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
] as const;

function isGregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function getGregorianMonthLength(year: number, monthIndex: number): number {
  if (monthIndex === 1) {
    return isGregorianLeapYear(year) ? 29 : 28;
  }

  if ([3, 5, 8, 10].includes(monthIndex)) {
    return 30;
  }

  return 31;
}

export function DateConverter() {
  const today = useMemo(() => new Date(), []);
  const todayTredeco = useMemo(() => gregorianToTredeco(today), [today]);
  const initialTredecoYear = todayTredeco.year;
  const initialTredecoMonthIndex = todayTredeco.month === 'Limes'
    ? 13
    : Math.max(0, TREDECO_MONTHS.findIndex((month) => month === todayTredeco.month));
  const initialTredecoDay = todayTredeco.month === 'Limes' ? todayTredeco.day : todayTredeco.day;

  const [mode, setMode] = useState<ConverterMode>('gregorianToTredeco');

  const [gregorianYear, setGregorianYear] = useState<number>(today.getFullYear());
  const [gregorianMonthIndex, setGregorianMonthIndex] = useState<number>(today.getMonth());
  const [gregorianDay, setGregorianDay] = useState<number>(today.getDate());
  const [gregorianResult, setGregorianResult] = useState<string>('');

  const [tredecoYear, setTredecoYear] = useState<number>(initialTredecoYear);
  const [tredecoMonthIndex, setTredecoMonthIndex] = useState<number>(initialTredecoMonthIndex);
  const [tredecoDay, setTredecoDay] = useState<number>(initialTredecoDay);
  const [tredecoResult, setTredecoResult] = useState<string>('');

  useEffect(() => {
    if (gregorianYear === 0 || gregorianDay === 0) {
      setGregorianResult('Rok, miesiąc i dzień muszą być uzupełnione.');
      return;
    }

    if (
      !Number.isInteger(gregorianYear) ||
      !Number.isInteger(gregorianMonthIndex) ||
      !Number.isInteger(gregorianDay)
    ) {
      setGregorianResult('Rok, miesiąc i dzień muszą być liczbami całkowitymi.');
      return;
    }

    if (gregorianMonthIndex < 0 || gregorianMonthIndex > 11) {
      setGregorianResult('Nieprawidłowy miesiąc gregoriański.');
      return;
    }

    const maxDaysInMonth = getGregorianMonthLength(gregorianYear, gregorianMonthIndex);
    if (gregorianDay < 1 || gregorianDay > maxDaysInMonth) {
      setGregorianResult(
        `Nieprawidłowy dzień. ${GREGORIAN_MONTHS[gregorianMonthIndex]} ${gregorianYear} ma ${maxDaysInMonth} dni.`
      );
      return;
    }

    try {
      const parsedDate = new Date(gregorianYear, gregorianMonthIndex, gregorianDay);
      const tredeco = gregorianToTredeco(parsedDate);
      const startWeekday = getStartWeekdayOfMarch1st(tredeco.year);
      
      let tredecoWeekday: string;
      let tredecoDisplay: string;
      
      if (tredeco.month === 'Limes') {
        const dayName = tredeco.day === 1 ? 'Nilo' : 'Bix';
        const gregorianWeekday = format(parsedDate, 'EEEE', { locale: pl });
        tredecoWeekday = gregorianWeekday;
        tredecoDisplay = `${dayName}, Limes ${tredeco.year}`;
      } else {
        tredecoWeekday = getTredecoWeekday(tredeco.day, startWeekday).toLocaleLowerCase('pl-PL');
        tredecoDisplay = `${tredeco.day} ${tredeco.month}`;
      }
      
      const label = `${tredecoWeekday}, ${tredecoDisplay}`;

      setGregorianResult(label);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Błąd konwersji.';
      setGregorianResult(message);
    }
  }, [gregorianYear, gregorianMonthIndex, gregorianDay]);

  useEffect(() => {
    try {
      if (tredecoYear === 0 || tredecoDay === 0) {
        setTredecoResult('Rok i dzień muszą być uzupełnione.');
        return;
      }

      if (!Number.isInteger(tredecoYear) || !Number.isInteger(tredecoDay)) {
        setTredecoResult('Rok i dzień muszą być liczbami całkowitymi.');
        return;
      }

      const gregorian = tredecoToGregorian(tredecoYear, tredecoMonthIndex, tredecoDay);
      
      let gregorianLabel: string;
      if (tredecoMonthIndex === 13) {
        const dayName = tredecoDay === 1 ? 'Nilo' : 'Bix';
        const weekdayName = format(gregorian, 'EEEE', { locale: pl });
        gregorianLabel = `${weekdayName}, ${format(gregorian, 'dd.MM.yyyy', { locale: pl })} (${dayName})`;
      } else {
        gregorianLabel = format(gregorian, 'EEEE, dd.MM.yyyy', { locale: pl });
      }
      
      setTredecoResult(gregorianLabel);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Błąd konwersji.';
      setTredecoResult(message);
    }
  }, [tredecoYear, tredecoMonthIndex, tredecoDay]);

  const maxGregorianDay = getGregorianMonthLength(gregorianYear || today.getFullYear(), gregorianMonthIndex);
  const maxTredecoDay = tredecoMonthIndex === 13 ? (isTredecoLeapYear(tredecoYear) ? 2 : 1) : 28;
  const tredecoDayLabel = tredecoMonthIndex === 13 ? 'Dzień' : 'Dzień (1-28)';
  const isLimes = tredecoMonthIndex === 13;
  const isLeapYear = isTredecoLeapYear(tredecoYear);

  const handleDayChange = (value: number) => {
    setTredecoDay(value);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-xl font-semibold">Konwerter Dat</h3>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('gregorianToTredeco')}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            mode === 'gregorianToTredeco'
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Gregoriański → Tredeco
        </button>
        <button
          type="button"
          onClick={() => setMode('tredecoToGregorian')}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            mode === 'tredecoToGregorian'
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Tredeco → Gregoriański
        </button>
      </div>

      {mode === 'gregorianToTredeco' ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-300">Rok</span>
              <input
                type="number"
                value={gregorianYear || ''}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setGregorianYear(nextValue === '' ? 0 : Number(nextValue));
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-300">Miesiąc</span>
              <select
                value={gregorianMonthIndex}
                onChange={(event) => setGregorianMonthIndex(Number(event.target.value))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
              >
                {GREGORIAN_MONTHS.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-300">Dzień</span>
              <input
                type="number"
                min={1}
                max={maxGregorianDay}
                value={gregorianDay || ''}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setGregorianDay(nextValue === '' ? 0 : Number(nextValue));
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
          </div>

          <p className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-xl font-semibold tracking-tight text-emerald-900 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            {gregorianResult}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-300">Rok Tredeco</span>
              <input
                type="number"
                value={tredecoYear || ''}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setTredecoYear(nextValue === '' ? 0 : Number(nextValue));
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-300">Miesiąc</span>
              <select
                value={tredecoMonthIndex}
                onChange={(event) => setTredecoMonthIndex(Number(event.target.value))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
              >
                {TREDECO_MONTHS.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-300">{tredecoDayLabel}</span>
              {isLimes ? (
                <select
                  value={tredecoDay || ''}
                  onChange={(event) => handleDayChange(Number(event.target.value))}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value={1}>Nilo</option>
                  {isLeapYear && <option value={2}>Bix</option>}
                </select>
              ) : (
                <input
                  type="number"
                  min={1}
                  max={maxTredecoDay}
                  value={tredecoDay || ''}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setTredecoDay(nextValue === '' ? 0 : Number(nextValue));
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
                />
              )}
            </label>
          </div>

          <p className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-xl font-semibold tracking-tight text-emerald-900 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            {tredecoResult}
          </p>
        </div>
      )}
    </section>
  );
}
