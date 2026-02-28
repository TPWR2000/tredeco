import { CalendarDays } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  TREDECO_MONTHS,
  TREDECO_WEEKDAYS_SHORT,
  getStartWeekdayOfMarch1st,
  getTredecoWeekdayIndex,
  gregorianToTredeco,
  isTredecoLeapYear,
} from '../logic/tredecoEngine';

function rotateWeekdays(startIndex: number): string[] {
  return [
    ...TREDECO_WEEKDAYS_SHORT.slice(startIndex),
    ...TREDECO_WEEKDAYS_SHORT.slice(0, startIndex),
  ];
}

type MonthCardProps = {
  monthName: string;
  weekdayHeaders: string[];
  isToday: boolean;
  todayDay: number | null;
};

function MonthCard({ monthName, weekdayHeaders, isToday, todayDay }: MonthCardProps) {
  const days = Array.from({ length: 28 }, (_, index) => index + 1);
  const sundayColumnIndex = weekdayHeaders.findIndex((label) => label === 'Nd');
  const saturdayColumnIndex = weekdayHeaders.findIndex((label) => label === 'Sb');

  return (
    <article className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">{monthName}</h3>

      <table className="w-full table-fixed border-collapse text-center">
        <thead className="border-b border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80">
          <tr>
            {weekdayHeaders.map((label, colIndex) => {
              const isSundayColumn = colIndex === sundayColumnIndex;
              const isSaturdayColumn = colIndex === saturdayColumnIndex;

              return (
                <th
                  key={label}
                  className={`px-1 pb-2 pt-1 text-xs font-medium ${
                    isSundayColumn
                      ? 'font-semibold text-red-500 dark:text-red-400'
                      : 'text-slate-500 dark:text-slate-400'
                  } ${isSaturdayColumn ? 'border-r border-slate-300 dark:border-slate-700' : ''}`}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }, (_, row) => (
            <tr key={row}>
              {days.slice(row * 7, row * 7 + 7).map((day, colIndex) => {
                const isCurrentCell = isToday && todayDay === day;
                const isSundayColumn = colIndex === sundayColumnIndex;
                const isSaturdayColumn = colIndex === saturdayColumnIndex;

                return (
                  <td
                    key={day}
                    className={`p-1 align-middle ${
                      isSundayColumn ? 'bg-red-500/10 dark:bg-red-500/10' : ''
                    } ${isSaturdayColumn ? 'border-r border-slate-300 dark:border-slate-700' : ''}`}
                  >
                    <span
                      className={`${isCurrentCell ? 'today ' : ''}mx-auto flex aspect-square w-full max-w-10 items-center justify-center rounded-lg font-mono text-sm font-semibold tabular-nums transition-transform ${
                        isCurrentCell
                          ? isSundayColumn
                            ? 'scale-110 bg-gradient-to-br from-cyan-500 to-emerald-500 text-red-50 ring-2 ring-red-300 shadow-lg shadow-cyan-500/40 animate-pulse [animation-duration:1.8s]'
                            : 'scale-110 bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/40 animate-pulse [animation-duration:1.8s]'
                          : isSundayColumn
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {day}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

type LimesCardProps = {
  weekdayHeaders: string[];
  hasBix: boolean;
  isToday: boolean;
  todayDay: number | null;
};

function LimesCard({ weekdayHeaders, hasBix, isToday, todayDay }: LimesCardProps) {
  const niloDay = 365;
  const bixDay = 366;

  const niloWeekdayIndex = (niloDay - 1) % 7;
  const bixWeekdayIndex = (bixDay - 1) % 7;

  const niloWeekday = weekdayHeaders[niloWeekdayIndex];
  const bixWeekday = weekdayHeaders[bixWeekdayIndex];

  const isNiloToday = isToday && todayDay === 1;
  const isBixToday = isToday && todayDay === 2;

  return (
    <article className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Limes</h3>

      <div className="flex flex-col gap-0.5">
        <div
          className={`flex flex-1 items-center justify-center rounded-md py-3 font-mono text-base font-semibold transition-all ${
            isNiloToday
              ? 'today bg-gradient-to-br from-cyan-500 to-emerald-500 text-white ring-2 ring-cyan-300 shadow-lg shadow-cyan-500/40 animate-pulse [animation-duration:1.8s]'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          Nilo <span className="ml-1 opacity-70">({niloWeekday})</span>
        </div>

        {hasBix ? (
          <div
            className={`flex flex-1 items-center justify-center rounded-md py-3 font-mono text-base font-semibold transition-all ${
              isBixToday
                ? 'today bg-gradient-to-br from-cyan-500 to-emerald-500 text-white ring-2 ring-cyan-300 shadow-lg shadow-cyan-500/40 animate-pulse [animation-duration:1.8s]'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            Bix <span className="ml-1 opacity-70">({bixWeekday})</span>
          </div>
        ) : (
          <div className="flex flex-1" />
        )}
      </div>
    </article>
  );
}

export function FullCalendar() {
  const now = useMemo(() => new Date(), []);
  const nowTredeco = useMemo(() => gregorianToTredeco(now), [now]);
  const [selectedYear, setSelectedYear] = useState<number>(nowTredeco.year);
  const [yearInput, setYearInput] = useState<string>(String(nowTredeco.year));

  const currentMonthIndex =
    nowTredeco.month === 'Limes'
      ? 13
      : TREDECO_MONTHS.findIndex((month) => month === nowTredeco.month);

  const scrollToToday = useCallback(() => {
    document.querySelector('.today')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const canSubmitYearInput = yearInput.trim() !== '' && Number.isInteger(Number(yearInput));
  const goToTypedYear = () => {
    if (!canSubmitYearInput) {
      return;
    }

    setSelectedYear(Number(yearInput));
  };

  const startWeekdayOfMarch1st = getStartWeekdayOfMarch1st(selectedYear);
  const firstDayWeekday = getTredecoWeekdayIndex(1, startWeekdayOfMarch1st);
  const weekdayHeaders = rotateWeekdays(firstDayWeekday);

  const shouldHighlightTodayInMonths =
    selectedYear === nowTredeco.year && currentMonthIndex !== null && currentMonthIndex < 13;
  const hasBix = isTredecoLeapYear(selectedYear);
  const isViewingCurrentYear = selectedYear === nowTredeco.year;

  return (
    <section className="mx-auto max-w-[1400px] space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">Kalendarz Pełny</h2>
      </div>

      <form
        className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        onSubmit={(event) => {
          event.preventDefault();
          goToTypedYear();
        }}
      >
        <button
          type="button"
          onClick={() => {
            const newYear = selectedYear - 1;
            setSelectedYear(newYear);
            setYearInput(String(newYear));
          }}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
          aria-label="Poprzedni rok"
        >
          ‹
        </button>
        <input
          type="number"
          value={yearInput}
          onChange={(event) => setYearInput(event.target.value)}
          placeholder="Wpisz rok..."
          className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
        <button
          type="button"
          onClick={() => {
            const newYear = selectedYear + 1;
            setSelectedYear(newYear);
            setYearInput(String(newYear));
          }}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
          aria-label="Następny rok"
        >
          ›
        </button>
        <button
          type="submit"
          disabled={!canSubmitYearInput}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Przejdź
        </button>
      </form>

      <article className="space-y-5">
        <h3 className="text-2xl font-semibold tracking-tight">Rok Tredeco {selectedYear}</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {TREDECO_MONTHS.slice(0, 13).map((monthName, monthIndex) => (
            <MonthCard
              key={`${selectedYear}-${monthName}`}
              monthName={monthName}
              weekdayHeaders={weekdayHeaders}
              isToday={shouldHighlightTodayInMonths && currentMonthIndex === monthIndex}
              todayDay={nowTredeco.day}
            />
          ))}

          <LimesCard
            weekdayHeaders={weekdayHeaders}
            hasBix={hasBix}
            isToday={selectedYear === nowTredeco.year && nowTredeco.month === 'Limes'}
            todayDay={nowTredeco.day}
          />
        </div>
      </article>

      {isViewingCurrentYear ? (
        <button
          type="button"
          onClick={scrollToToday}
          className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/30 transition hover:bg-emerald-500 md:hidden"
          aria-label="Przewiń do dzisiejszego dnia Tredeco"
        >
          <CalendarDays size={16} />
          Dzisiaj
        </button>
      ) : null}
    </section>
  );
}
