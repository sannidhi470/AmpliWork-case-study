/** Pure chart-math + label helpers shared by the Stats charts. */

export const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/**
 * "2024-07" -> "JUL". January also carries the 2-digit year ("JAN '24") so a
 * multi-year x-axis stays readable without every tick showing a year.
 */
export function monthAxisLabel(yearMonth: string, yearOnJanuary = true): string {
  const month = Number(yearMonth.slice(5));
  const abbr = MONTH_ABBR[month - 1] ?? yearMonth;
  if (yearOnJanuary && month === 1) {
    return `${abbr} '${yearMonth.slice(2, 4)}`;
  }
  return abbr;
}

/** Round a positive peak up to a clean axis maximum (e.g. 184k -> 200k). */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  const niceN = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return niceN * pow;
}

/** Classic "nice number" for axis ranges/steps. */
function niceNum(range: number, round: boolean): number {
  if (range <= 0) return 1;
  const exp = Math.floor(Math.log10(range));
  const frac = range / Math.pow(10, exp);
  let niceFrac: number;
  if (round) {
    niceFrac = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  } else {
    niceFrac = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  }
  return niceFrac * Math.pow(10, exp);
}

export interface NiceScale {
  min: number;
  max: number;
  step: number;
  /** Tick values from `max` (top) down to `min` (bottom). */
  ticksDesc: number[];
}

/**
 * Build a fitted, rounded scale for a value range (supports negatives).
 * Useful for a line chart whose values don't start at zero.
 */
export function niceScale(
  dataMin: number,
  dataMax: number,
  tickCount = 4,
): NiceScale {
  let min = dataMin;
  let max = dataMax;
  if (min === max) {
    // Flat series: pad so we still render a band.
    const pad = Math.abs(min) || 1;
    min -= pad;
    max += pad;
  }
  const range = niceNum(max - min, false);
  const step = niceNum(range / tickCount, true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  const ticksDesc: number[] = [];
  for (let v = niceMax; v >= niceMin - step / 2; v -= step) {
    ticksDesc.push(Number(v.toFixed(2)));
  }
  return { min: niceMin, max: niceMax, step, ticksDesc };
}
