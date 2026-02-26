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

type SyncDayTileProps = {
  title: string;
  dayLabel: string;
  description: string;
  highlighted: boolean;
  centered?: boolean;
};

function SyncDayTile({
  title,
  dayLabel,
  description,
  highlighted,
  centered = false,
}: SyncDayTileProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const updateTooltipPosition = (clientX: number, clientY: number) => {
    setTooltipPosition({
      top: clientY - 20,
      left: clientX,
    });
  };

  return (
    <div
      className={`relative ${centered ? 'w-full max-w-sm' : ''}`}
      onMouseEnter={() => setIsTooltipOpen(true)}
      onMouseLeave={() => setIsTooltipOpen(false)}
      onMouseMove={(event) => updateTooltipPosition(event.clientX, event.clientY)}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        if (!touch) {
          return;
        }

        updateTooltipPosition(touch.clientX, touch.clientY);
        setIsTooltipOpen(true);
      }}
      onTouchMove={(event) => {
        const touch = event.touches[0];
        if (!touch) {
          return;
        }

        updateTooltipPosition(touch.clientX, touch.clientY);
      }}
      onTouchEnd={() => setIsTooltipOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsTooltipOpen((current) => !current)}
        onFocus={() => setIsTooltipOpen(true)}
        onBlur={() => setIsTooltipOpen(false)}
        className={`w-full rounded-2xl border px-4 py-5 text-center transition ${
          highlighted
            ? 'today border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-300/70 animate-pulse [animation-duration:1.8s]'
            : 'border-indigo-200 bg-white/90 dark:border-indigo-700 dark:bg-slate-900/90'
        }`}
      >
        <p className="text-xl font-semibold">{title}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{dayLabel}</p>
      </button>

      <div
        className="pointer-events-none fixed z-[120] w-[min(28rem,90vw)] rounded-xl border border-slate-600/70 bg-slate-800/90 p-3 text-left text-xs leading-relaxed text-slate-100 shadow-xl backdrop-blur-md transition-all duration-200"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: isTooltipOpen
            ? 'translate(-50%, -100%)'
            : 'translate(-50%, calc(-100% + 6px))',
          opacity: isTooltipOpen ? 1 : 0,
        }}
      >
        {description}
      </div>
    </div>
  );
}

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

export function FullCalendar() {
  const now = useMemo(() => new Date(), []);
  const nowTredeco = useMemo(() => gregorianToTredeco(now), [now]);
  const [selectedYear, setSelectedYear] = useState<number>(nowTredeco.year);
  const [yearInput, setYearInput] = useState<string>(String(nowTredeco.year));

  const currentMonthIndex =
    !nowTredeco.isNilo && !nowTredeco.isBix
      ? TREDECO_MONTHS.findIndex((month) => month === nowTredeco.month)
      : null;

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
    selectedYear === nowTredeco.year && currentMonthIndex !== null;
  const shouldHighlightNilo = selectedYear === nowTredeco.year && nowTredeco.isNilo;
  const shouldHighlightBix = selectedYear === nowTredeco.year && nowTredeco.isBix;
  const hasBix = isTredecoLeapYear(selectedYear);
  const isViewingCurrentYear = selectedYear === nowTredeco.year;

  return (
    <section className="mx-auto max-w-[1400px] space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">Kalendarz Pełny</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Wpisz rok Tredeco. Widok renderuje 13 miesięcy (4x7) i dni synchronizacji.
        </p>
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
          {TREDECO_MONTHS.map((monthName, monthIndex) => (
            <MonthCard
              key={`${selectedYear}-${monthName}`}
              monthName={monthName}
              weekdayHeaders={weekdayHeaders}
              isToday={shouldHighlightTodayInMonths && currentMonthIndex === monthIndex}
              todayDay={nowTredeco.day}
            />
          ))}

          <article className="rounded-2xl border border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-5 shadow-sm dark:border-indigo-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/50">
            <h4 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Dni Synchronizacji
            </h4>

            <div className={hasBix ? 'space-y-3' : 'flex justify-center'}>
              <SyncDayTile
                title="Nilo"
                dayLabel="Dzień 365"
                highlighted={shouldHighlightNilo}
                centered={!hasBix}
                description="365. dzień roku, wypadający po 28. Tredeco. Dzień Zero, który domyka cykl i synchronizuje kalendarz z obiegiem Ziemi wokół Słońca."
              />

              {hasBix ? (
                <SyncDayTile
                  title="Bix"
                  dayLabel="Dzień 366"
                  highlighted={shouldHighlightBix}
                  description="Dzień przestępny dodawany co 4 lata. Zapewnia długoterminową stabilność astronomiczną systemu Tredeco."
                />
              ) : null}
            </div>
          </article>
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
