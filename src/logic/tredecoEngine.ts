export const TREDECO_MONTHS = [
  'Primo',
  'Secundo',
  'Terzo',
  'Quarto',
  'Quinto',
  'Sexto',
  'Septo',
  'Octo',
  'Nono',
  'Decimo',
  'Undeco',
  'Duodeco',
  'Tredeco',
] as const;

export const TREDECO_WEEKDAYS = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela',
] as const;

export const TREDECO_WEEKDAYS_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'] as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type TredecoDate = {
  month: string;
  day: number;
  isNilo: boolean;
  isBix: boolean;
  year: number;
};

export type TredecoCalculationInput = {
  amount: number;
  multiplier: number;
};

export type TredecoCalculationResult = {
  score: number;
};

function isGregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function normalizeMondayFirstIndex(jsWeekday: number): number {
  return (jsWeekday + 6) % 7;
}

export function isTredecoLeapYear(tredecoYear: number): boolean {
  // Rok Tredeco Y trwa od 1 marca Y do końca lutego Y+1.
  return isGregorianLeapYear(tredecoYear + 1);
}

export function getStartWeekdayOfMarch1st(tredecoYear: number): number {
  // Rok Tredeco zawsze startuje 1 marca danego roku gregoriańskiego.
  // Wyznaczamy rzeczywisty weekday dla 1 marca i mapujemy do indeksu z poniedziałkiem jako 0.
  const march1UtcWeekday = new Date(Date.UTC(tredecoYear, 2, 1)).getUTCDay();
  return normalizeMondayFirstIndex(march1UtcWeekday);
}

export function getTredecoWeekdayIndex(
  tredecoDay: number,
  startWeekdayOfMarch1st: number
): number {
  if (!Number.isInteger(tredecoDay) || tredecoDay < 1) {
    throw new Error('tredecoDay musi być dodatnią liczbą całkowitą.');
  }

  if (
    !Number.isInteger(startWeekdayOfMarch1st) ||
    startWeekdayOfMarch1st < 0 ||
    startWeekdayOfMarch1st > 6
  ) {
    throw new Error('startWeekdayOfMarch1st musi być w zakresie 0-6.');
  }

  // W stałej siatce 4x7 dzień tygodnia zależy wyłącznie od pozycji 1-28,
  // a układ powtarza się co 7 dni w obrębie każdego miesiąca.
  return (startWeekdayOfMarch1st + ((tredecoDay - 1) % 7)) % 7;
}

export function getTredecoWeekday(
  tredecoDay: number,
  startWeekdayOfMarch1st: number
): string {
  const weekdayIndex = getTredecoWeekdayIndex(tredecoDay, startWeekdayOfMarch1st);
  return TREDECO_WEEKDAYS[weekdayIndex];
}

export function getTredecoDayOfYearFromDate(tredecoDate: TredecoDate): number | null {
  if (tredecoDate.isNilo || tredecoDate.isBix) {
    return null;
  }

  const monthIndex = TREDECO_MONTHS.findIndex((month) => month === tredecoDate.month);
  if (monthIndex < 0) {
    return null;
  }

  return monthIndex * 28 + tredecoDate.day;
}

function resolveTredecoYear(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month >= 2 ? year : year - 1;
}

function getTredecoDayOfYear(date: Date, tredecoYear: number): number {
  const targetUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const startUtc = Date.UTC(tredecoYear, 2, 1);
  return Math.floor((targetUtc - startUtc) / MS_PER_DAY) + 1;
}

export function gregorianToTredeco(date: Date): TredecoDate {
  const year = resolveTredecoYear(date);
  const dayOfYear = getTredecoDayOfYear(date, year);
  const yearLength = isTredecoLeapYear(year) ? 366 : 365;

  if (dayOfYear < 1 || dayOfYear > yearLength) {
    throw new Error('Podana data nie mieści się w wyliczonym roku Tredeco.');
  }

  if (dayOfYear === 365) {
    return { month: 'Nilo', day: 1, isNilo: true, isBix: false, year };
  }

  if (dayOfYear === 366) {
    return { month: 'Bix', day: 1, isNilo: false, isBix: true, year };
  }

  const zeroBased = dayOfYear - 1;
  const monthIndex = Math.floor(zeroBased / 28);
  const day = (zeroBased % 28) + 1;

  return {
    month: TREDECO_MONTHS[monthIndex],
    day,
    isNilo: false,
    isBix: false,
    year,
  };
}

export function tredecoToGregorian(
  year: number,
  monthIndex: number,
  day: number
): Date {
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || !Number.isInteger(day)) {
    throw new Error('year, monthIndex i day muszą być liczbami całkowitymi.');
  }

  let offsetDays: number;

  if (monthIndex >= 0 && monthIndex < TREDECO_MONTHS.length) {
    if (day < 1 || day > 28) {
      throw new Error('Dla miesięcy Primo-Tredeco dozwolone dni to 1-28.');
    }
    offsetDays = monthIndex * 28 + (day - 1);
  } else if (monthIndex === TREDECO_MONTHS.length) {
    if (day !== 1) {
      throw new Error('Dzień Nilo musi mieć wartość 1.');
    }
    offsetDays = 364;
  } else if (monthIndex === TREDECO_MONTHS.length + 1) {
    if (!isTredecoLeapYear(year)) {
      throw new Error('Bix istnieje tylko w przestępnym roku Tredeco.');
    }
    if (day !== 1) {
      throw new Error('Dzień Bix musi mieć wartość 1.');
    }
    offsetDays = 365;
  } else {
    throw new Error('Nieprawidłowy monthIndex. Użyj 0-12, 13 (Nilo) lub 14 (Bix).');
  }

  const startUtc = Date.UTC(year, 2, 1);
  return new Date(startUtc + offsetDays * MS_PER_DAY);
}

export function calculateTredecoScore({
  amount,
  multiplier,
}: TredecoCalculationInput): TredecoCalculationResult {
  return {
    score: amount * multiplier,
  };
}
