import { useEffect, useMemo, useState } from 'react';
import {
  TREDECO_MONTHS,
  TREDECO_WEEKDAYS,
  getAbsoluteDay,
  gregorianToTredeco,
  getStartWeekdayOfMarch1st,
  isTredecoLeapYear,
  tredecoToGregorian,
} from '../logic/tredecoEngine';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export function DateCalculator() {
  const today = useMemo(() => new Date(), []);
  const todayTredeco = useMemo(() => gregorianToTredeco(today), [today]);

  const initialMonthIndex = todayTredeco.month === 'Limes'
    ? 13
    : Math.max(0, TREDECO_MONTHS.findIndex((month) => month === todayTredeco.month));
  const initialDay = todayTredeco.month === 'Limes' ? todayTredeco.day : todayTredeco.day;

  const [targetYear, setTargetYear] = useState<number>(todayTredeco.year);
  const [targetMonthIndex, setTargetMonthIndex] = useState<number>(initialMonthIndex);
  const [targetDay, setTargetDay] = useState<number>(initialDay);
  const [result, setResult] = useState<string>('');

  const isLeap = isTredecoLeapYear(targetYear);
  const isLimes = targetMonthIndex === 13;

  const handleMonthChange = (newMonth: number) => {
    setTargetMonthIndex(newMonth);
    if (newMonth === 13) {
      setTargetDay(1);
    } else if (targetDay > 28) {
      setTargetDay(28);
    }
  };

  const handleDayChange = (value: number) => {
    setTargetDay(value);
  };

  useEffect(() => {
    if (targetYear === 0 || targetDay === 0) {
      setResult('Rok i dzień muszą być uzupełnione.');
      return;
    }

    if (!Number.isInteger(targetYear) || !Number.isInteger(targetDay)) {
      setResult('Rok i dzień muszą być liczbami całkowitymi.');
      return;
    }

    try {
      const currentMonthIdx = todayTredeco.month === 'Limes'
        ? 13
        : TREDECO_MONTHS.indexOf(todayTredeco.month as typeof TREDECO_MONTHS[number]);
      const currentAbsolute = getAbsoluteDay(todayTredeco.year, currentMonthIdx, todayTredeco.day);
      const targetAbsolute = getAbsoluteDay(targetYear, targetMonthIndex, targetDay);
      const totalDays = targetAbsolute - currentAbsolute;

      let label: string;
      if (totalDays === 0) {
        label = 'Dzisiaj!';
      } else if (totalDays === 1) {
        label = 'Jutro!';
      } else if (totalDays === -1) {
        label = 'Wczoraj!';
      } else if (totalDays > 0) {
        label = `Za ${totalDays} dni`;
      } else {
        label = `${Math.abs(totalDays)} dni temu`;
      }

      let weekday: string;
      if (isLimes) {
        const gregorianDate = tredecoToGregorian(targetYear, targetMonthIndex, targetDay);
        weekday = format(gregorianDate, 'EEEE', { locale: pl });
      } else {
        const startWeekday = getStartWeekdayOfMarch1st(targetYear);
        const weekdayIndex = (startWeekday + ((targetDay - 1) % 7)) % 7;
        weekday = TREDECO_WEEKDAYS[weekdayIndex];
      }

      const dateLabel = isLimes
        ? `${targetDay === 1 ? 'Nilo' : 'Bix'} ${TREDECO_MONTHS[13]} ${targetYear}`
        : `${targetDay} ${TREDECO_MONTHS[targetMonthIndex]} ${targetYear}`;

      setResult(`${weekday}, ${dateLabel} (${label})`);
    } catch {
      setResult('Nie udało się obliczyć daty.');
    }
  }, [targetYear, targetMonthIndex, targetDay, todayTredeco]);

  const maxTredecoDay = targetMonthIndex === 13 ? (isLeap ? 2 : 1) : 28;
  const tredecoDayLabel = targetMonthIndex === 13 ? 'Dzień' : 'Dzień (1-28)';

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-4 text-xl font-semibold">Odliczanie do daty</h3>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-sm text-slate-600 dark:text-slate-300">Rok</span>
          <input
            type="number"
            value={targetYear || ''}
            onChange={(e) => {
              const nextValue = e.target.value;
              setTargetYear(nextValue === '' ? 0 : Number(nextValue));
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-slate-600 dark:text-slate-300">Miesiąc</span>
          <select
            value={targetMonthIndex}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
          >
            {TREDECO_MONTHS.map((month, idx) => (
              <option key={month} value={idx}>
                {idx + 1}. {month}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-slate-600 dark:text-slate-300">{tredecoDayLabel}</span>
          {isLimes ? (
            <select
              value={targetDay || ''}
              onChange={(e) => handleDayChange(Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value={1}>Nilo</option>
              {isLeap && <option value={2}>Bix</option>}
            </select>
          ) : (
            <input
              type="number"
              min={1}
              max={maxTredecoDay}
              value={targetDay || ''}
              onChange={(e) => {
                const nextValue = e.target.value;
                setTargetDay(nextValue === '' ? 0 : Number(nextValue));
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
            />
          )}
        </label>
      </div>

      <div className="flex flex-wrap justify-center rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-center text-xl font-semibold tracking-tight text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
        {result}
      </div>
    </div>
  );
}
