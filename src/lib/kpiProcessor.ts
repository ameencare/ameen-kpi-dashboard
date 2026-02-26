import Papa from 'papaparse';

export const KPI_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQutQS4s8tD0RvraTwJ-9R4aZ6UDzYSnXNaDjriZ5-Ymf8AaXNegHIgmbl3Kw9aLA/pub?gid=1011385743&single=true&output=csv';
export const STATS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQutQS4s8tD0RvraTwJ-9R4aZ6UDzYSnXNaDjriZ5-Ymf8AaXNegHIgmbl3Kw9aLA/pub?gid=1103800852&single=true&output=csv';

export interface KPIMetricData {
  name: string;
  definition: string;
  currentValue: number;
  previousValue: number;
  delta: number;
  percentChange: number;
  valueType: 'number' | 'percentage' | 'currency' | 'ratio';
  sparklineData: { week: string; value: number }[];
  isPositiveGood: boolean;
}

export interface KPIData {
  metrics: KPIMetricData[];
  metricsByName: Record<string, KPIMetricData>;
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  allWeekDates: string[];
}

// Top 5 KPI metric keys
export const TOP_KPI_KEYS = [
  '#Active patients',
  '#Completed sessions',
  '#Active ameeners',
  'Gross weekly revenue',
  '#Active Partenerships',
];

export const TOP_KPI_DISPLAY_NAMES: Record<string, string> = {
  '#Active Partenerships': '#Active Partnerships',
};

// Metrics where a decrease is positive
const INVERSE_METRICS = new Set([
  'Missed sessions rate', 'Patient acquisition cost (PAC)',
  '#Deactive ameeners', 'Refund amounts', 'Ameeners fines',
  '#Undelivered sessions', "Patients' compensations",
  "Ameeners' receivables of refund", 'Refunded amounts',
  'Ameeners compensation',
]);

// Drilldown mapping
export const DRILLDOWN_MAP: Record<string, string[]> = {
  '#Active patients': [
    '#Website visits', '#Phone calls', '#WA conversations', '#Sign up',
    '#Drafts', '#Completed bookings', 'Approval bookings rate',
    '#B-C active patients', '#B-B active patients', '#B-B-C active patients',
    'Patients ameener ratio', 'Patient acquisition cost (PAC)',
    'Net promoter score (NPS)', '#Referral', '#Word of mouth',
  ],
  '#Completed sessions': [
    '#Scheduled sessions', 'Missed sessions rate', '#Completed ex. Sessions',
    'Activation rate', '#Completed TTT Sessions',
  ],
  '#Active ameeners': [
    "Ameener' sessions per day", '#New active ameeners', '#Reactivated ameeners',
    '#Ready to be activated ameeners', '#Deactive ameeners',
  ],
  'Gross weekly revenue': [
    'Expected collections', 'B-C revenue', 'B-B revenue', 'B-B-C revenue',
    'Ex.sessions revenue', 'New TTT plans revenue', 'Renew TTT plans revenue',
    'TTT plan approval Rate', '#New TTT plans', "#New TTT plans' sessions",
    '#Renew TTT plans', "#Renew TTT plans' sessions", 'Sessions per TTT plan',
    "Total ameeners' receivables", "Expected ameeners' receivables",
    "Paid ameeners' receivables", 'Receivable per ameener',
    "New ameeners' receivables",
    'Ameeners compensation', 'Ameeners incentives', 'Ameeners fines',
    'Refund amounts', "Ameeners' receivables of refund", 'Refunded amounts',
    '#Undelivered sessions', "Patients' compensations",
  ],
  "New ameeners' receivables": [],
  '#Active Partenerships': [
    '#New active Partnerships', '#Reactivated Partnerships',
  ],
};

export const KPI_ICONS: Record<string, string> = {
  '#Active patients': '👥',
  '#Completed sessions': '✅',
  '#Active ameeners': '🩺',
  'Gross weekly revenue': '💰',
  "New ameeners' receivables": '💵',
  '#Active Partenerships': '🤝',
};

function parseValue(raw: string): { value: number; type: 'number' | 'percentage' | 'currency' | 'ratio' } {
  if (!raw || raw.trim() === '' || raw.trim() === 'ew') return { value: NaN, type: 'number' };
  const s = raw.trim();
  if (s.endsWith('%')) {
    return { value: parseFloat(s.replace('%', '')) || 0, type: 'percentage' };
  }
  if (s.includes('SAR')) {
    const cleaned = s.replace(/SAR/g, '').replace(/,/g, '').trim();
    return { value: parseFloat(cleaned) || 0, type: 'currency' };
  }
  const num = parseFloat(s.replace(/,/g, ''));
  return { value: isNaN(num) ? 0 : num, type: 'number' };
}

function parseWeekDate(dateStr: string): Date {
  // Format: "07-Jan-2024"
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(NaN);
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return new Date(NaN);
  return new Date(year, month, day);
}

function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} → ${end.toLocaleDateString('en-US', opts)}`;
}

type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface WeekData {
  date: Date;
  dateStr: string;
  colIndex: number;
}

function getPopulatedWeeks(row: string[], weekColumns: WeekData[]): WeekData[] {
  return weekColumns.filter(w => {
    const val = row[w.colIndex];
    return val && val.trim() !== '' && val.trim() !== 'ew';
  });
}

function getPeriodIndices(
  populatedWeeks: WeekData[],
  periodType: PeriodType
): { current: WeekData[]; previous: WeekData[]; currentLabel: string; previousLabel: string } {
  if (populatedWeeks.length === 0) {
    return { current: [], previous: [], currentLabel: 'N/A', previousLabel: 'N/A' };
  }

  if (periodType === 'weekly') {
    const curr = populatedWeeks.length >= 1 ? [populatedWeeks[populatedWeeks.length - 1]] : [];
    const prev = populatedWeeks.length >= 2 ? [populatedWeeks[populatedWeeks.length - 2]] : [];
    const currEnd = curr[0] ? new Date(curr[0].date.getTime() + 6 * 86400000) : new Date();
    const prevEnd = prev[0] ? new Date(prev[0].date.getTime() + 6 * 86400000) : new Date();
    return {
      current: curr,
      previous: prev,
      currentLabel: curr[0] ? formatDateRange(curr[0].date, currEnd) : 'N/A',
      previousLabel: prev[0] ? formatDateRange(prev[0].date, prevEnd) : 'N/A',
    };
  }

  // Group weeks by period
  const groupKey = (d: Date) => {
    if (periodType === 'monthly') return `${d.getFullYear()}-${d.getMonth()}`;
    if (periodType === 'quarterly') return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3)}`;
    return `${d.getFullYear()}`;
  };

  const groups = new Map<string, WeekData[]>();
  for (const w of populatedWeeks) {
    const key = groupKey(w.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(w);
  }

  const keys = Array.from(groups.keys());
  if (keys.length === 0) return { current: [], previous: [], currentLabel: 'N/A', previousLabel: 'N/A' };

  const currKey = keys[keys.length - 1];
  const prevKey = keys.length >= 2 ? keys[keys.length - 2] : null;

  const currWeeks = groups.get(currKey)!;
  const prevWeeks = prevKey ? groups.get(prevKey)! : [];

  const label = (weeks: WeekData[]) => {
    if (weeks.length === 0) return 'N/A';
    const start = weeks[0].date;
    const lastWeek = weeks[weeks.length - 1].date;
    const end = new Date(lastWeek.getTime() + 6 * 86400000);
    return formatDateRange(start, end);
  };

  return {
    current: currWeeks,
    previous: prevWeeks,
    currentLabel: label(currWeeks),
    previousLabel: label(prevWeeks),
  };
}

function aggregateValues(row: string[], weeks: WeekData[], isRate: boolean): number {
  const values = weeks
    .map(w => parseValue(row[w.colIndex]).value)
    .filter(v => !isNaN(v));
  if (values.length === 0) return 0;
  if (isRate) return values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((a, b) => a + b, 0);
}

export async function fetchKPIData(periodType: PeriodType): Promise<KPIData> {
  const response = await fetch(KPI_CSV_URL);
  const text = await response.text();
  const parsed = Papa.parse(text, { header: false });
  const rows = parsed.data as string[][];

  if (rows.length < 2) throw new Error('No KPI data found');

  const headers = rows[0];
  // Columns 3+ are week dates
  const weekColumns: WeekData[] = [];
  for (let i = 3; i < headers.length; i++) {
    const d = parseWeekDate(headers[i]);
    if (!isNaN(d.getTime())) {
      weekColumns.push({ date: d, dateStr: headers[i], colIndex: i });
    }
  }

  const metrics: KPIMetricData[] = [];
  const metricsByName: Record<string, KPIMetricData> = {};
  let currentPeriodLabel = 'N/A';
  let previousPeriodLabel = 'N/A';

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row[0] || row[0].trim() === '') continue;

    const name = row[0].trim();
    const definition = row[1]?.trim() || '';
    const populatedWeeks = getPopulatedWeeks(row, weekColumns);

    if (populatedWeeks.length === 0) {
      // No data for this metric
      const m: KPIMetricData = {
        name, definition, currentValue: 0, previousValue: 0,
        delta: 0, percentChange: 0, valueType: 'number',
        sparklineData: [], isPositiveGood: !INVERSE_METRICS.has(name),
      };
      metrics.push(m);
      metricsByName[name] = m;
      continue;
    }

    // Determine value type from first populated value
    const sampleVal = row[populatedWeeks[0].colIndex];
    const { type: valueType } = parseValue(sampleVal);
    const isRate = valueType === 'percentage' || name.toLowerCase().includes('ratio') || name.toLowerCase().includes('per ');

    const { current, previous, currentLabel, previousLabel } = getPeriodIndices(populatedWeeks, periodType);
    currentPeriodLabel = currentLabel;
    previousPeriodLabel = previousLabel;

    const currentValue = aggregateValues(row, current, isRate);
    const previousValue = aggregateValues(row, previous, isRate);
    const delta = currentValue - previousValue;
    const percentChange = previousValue !== 0 ? ((delta / Math.abs(previousValue)) * 100) : (currentValue !== 0 ? 100 : 0);

    // Sparkline: last 12 populated weeks
    const sparkWeeks = populatedWeeks.slice(-12);
    const sparklineData = sparkWeeks.map(w => ({
      week: w.dateStr,
      value: parseValue(row[w.colIndex]).value || 0,
    }));

    const finalType = isRate ? (valueType === 'percentage' ? 'percentage' : 'ratio') : valueType;

    const m: KPIMetricData = {
      name, definition, currentValue, previousValue, delta, percentChange,
      valueType: finalType as 'number' | 'percentage' | 'currency' | 'ratio',
      sparklineData, isPositiveGood: !INVERSE_METRICS.has(name),
    };
    metrics.push(m);
    metricsByName[name] = m;
  }

  return {
    metrics,
    metricsByName,
    currentPeriodLabel,
    previousPeriodLabel,
    allWeekDates: weekColumns.map(w => w.dateStr),
  };
}

// Custom comparison: user picks specific periods to compare
interface CustomComparisonParams {
  enabled: boolean;
  periodType: PeriodType;
  year1: number;
  year2: number;
  period1: number;
  period2: number;
}

function getYearStartSunday(year: number): Date {
  const jan1 = new Date(year, 0, 1);
  const day = jan1.getDay();
  const offset = day === 0 ? 0 : 7 - day;
  return new Date(year, 0, 1 + offset);
}

function getCustomPeriodWeeks(
  weekColumns: WeekData[],
  periodType: PeriodType,
  year: number,
  period: number
): WeekData[] {
  const yearStart = getYearStartSunday(year);

  if (periodType === 'yearly') {
    // period is the year itself
    const ys = getYearStartSunday(period);
    const ye = new Date(ys.getTime() + 52 * 7 * 86400000);
    return weekColumns.filter(w => w.date >= ys && w.date < ye);
  }

  if (periodType === 'weekly') {
    // period = week number 1-52
    const weekStart = new Date(yearStart.getTime() + (period - 1) * 7 * 86400000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
    return weekColumns.filter(w => w.date >= weekStart && w.date < weekEnd);
  }

  if (periodType === 'monthly') {
    // period = month 1-12, each month = 4 weeks
    const monthStart = new Date(yearStart.getTime() + (period - 1) * 4 * 7 * 86400000);
    const monthEnd = new Date(monthStart.getTime() + 4 * 7 * 86400000);
    return weekColumns.filter(w => w.date >= monthStart && w.date < monthEnd);
  }

  if (periodType === 'quarterly') {
    // period = quarter 1-4, each quarter = 12 weeks
    const qStart = new Date(yearStart.getTime() + (period - 1) * 12 * 7 * 86400000);
    const qEnd = new Date(qStart.getTime() + 12 * 7 * 86400000);
    return weekColumns.filter(w => w.date >= qStart && w.date < qEnd);
  }

  return [];
}

function formatCustomLabel(periodType: PeriodType, year: number, period: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (periodType === 'weekly') return `Week ${period}, ${year}`;
  if (periodType === 'monthly') return `${months[period - 1]} ${year}`;
  if (periodType === 'quarterly') return `Q${period} ${year}`;
  return `${period}`;
}

export async function fetchKPIDataCustom(params: CustomComparisonParams): Promise<KPIData> {
  const response = await fetch(KPI_CSV_URL);
  const text = await response.text();
  const parsed = Papa.parse(text, { header: false });
  const rows = parsed.data as string[][];

  if (rows.length < 2) throw new Error('No KPI data found');

  const headers = rows[0];
  const weekColumns: WeekData[] = [];
  for (let i = 3; i < headers.length; i++) {
    const d = parseWeekDate(headers[i]);
    if (!isNaN(d.getTime())) {
      weekColumns.push({ date: d, dateStr: headers[i], colIndex: i });
    }
  }

  const currentWeeks = getCustomPeriodWeeks(weekColumns, params.periodType, params.year1, params.period1);
  const previousWeeks = getCustomPeriodWeeks(weekColumns, params.periodType, params.year2, params.period2);

  const currentPeriodLabel = formatCustomLabel(params.periodType, params.year1, params.period1);
  const previousPeriodLabel = formatCustomLabel(params.periodType, params.year2, params.period2);

  const metrics: KPIMetricData[] = [];
  const metricsByName: Record<string, KPIMetricData> = {};

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row[0] || row[0].trim() === '') continue;

    const name = row[0].trim();
    const definition = row[1]?.trim() || '';
    const populatedWeeks = getPopulatedWeeks(row, weekColumns);

    if (populatedWeeks.length === 0) {
      const m: KPIMetricData = {
        name, definition, currentValue: 0, previousValue: 0,
        delta: 0, percentChange: 0, valueType: 'number',
        sparklineData: [], isPositiveGood: !INVERSE_METRICS.has(name),
      };
      metrics.push(m);
      metricsByName[name] = m;
      continue;
    }

    const sampleVal = row[populatedWeeks[0].colIndex];
    const { type: valueType } = parseValue(sampleVal);
    const isRate = valueType === 'percentage' || name.toLowerCase().includes('ratio') || name.toLowerCase().includes('per ');

    const currWeeksForMetric = currentWeeks.filter(w => {
      const val = row[w.colIndex];
      return val && val.trim() !== '' && val.trim() !== 'ew';
    });
    const prevWeeksForMetric = previousWeeks.filter(w => {
      const val = row[w.colIndex];
      return val && val.trim() !== '' && val.trim() !== 'ew';
    });

    const currentValue = aggregateValues(row, currWeeksForMetric, isRate);
    const previousValue = aggregateValues(row, prevWeeksForMetric, isRate);
    const delta = currentValue - previousValue;
    const percentChange = previousValue !== 0 ? ((delta / Math.abs(previousValue)) * 100) : (currentValue !== 0 ? 100 : 0);

    const sparkWeeks = populatedWeeks.slice(-12);
    const sparklineData = sparkWeeks.map(w => ({
      week: w.dateStr,
      value: parseValue(row[w.colIndex]).value || 0,
    }));

    const finalType = isRate ? (valueType === 'percentage' ? 'percentage' : 'ratio') : valueType;

    const m: KPIMetricData = {
      name, definition, currentValue, previousValue, delta, percentChange,
      valueType: finalType as 'number' | 'percentage' | 'currency' | 'ratio',
      sparklineData, isPositiveGood: !INVERSE_METRICS.has(name),
    };
    metrics.push(m);
    metricsByName[name] = m;
  }

  return {
    metrics,
    metricsByName,
    currentPeriodLabel,
    previousPeriodLabel,
    allWeekDates: weekColumns.map(w => w.dateStr),
  };
}

export interface StatsRecord {
  phoneNumber: string;
  type: string;
  date: Date | null;
  dateStr: string;
  attemptTime: string;
  status: string;
  channel: string;
  city: string;
  service: string;
  gender: string;
  age: string;
  nationality: string;
  bookedBy: string;
  therapistClassification: string;
  preferredPeriod: string;
  timeToServe: string;
  paymentExSession: string;
  paymentTTT: string;
  paymentMethod: string;
}

function parseDDMMYYYY(s: string): Date | null {
  if (!s) return null;
  const parts = s.split('/');
  if (parts.length !== 3) return null;
  const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  return isNaN(d.getTime()) ? null : d;
}

export async function fetchStatsData(): Promise<StatsRecord[]> {
  const response = await fetch(STATS_CSV_URL);
  const text = await response.text();
  const parsed = Papa.parse(text, { header: false });
  const rows = parsed.data as string[][];

  if (rows.length < 2) return [];

  return rows.slice(1).filter(r => r[0] && r[0].trim()).map(r => ({
    phoneNumber: r[0] || '',
    type: r[1] || '',
    date: parseDDMMYYYY(r[2] || ''),
    dateStr: r[2] || '',
    attemptTime: r[3] || '',
    status: r[4] || '',
    channel: r[5] || '',
    city: r[6] || '',
    service: r[7] || '',
    gender: r[8] || '',
    age: r[9] || '',
    nationality: r[10] || '',
    bookedBy: r[11] || '',
    therapistClassification: r[16] || '',
    preferredPeriod: r[17] || '',
    timeToServe: r[18] || '',
    paymentExSession: r[19] || '',
    paymentTTT: r[22] || '',
    paymentMethod: r[23] || '',
  }));
}

export function countByField(records: StatsRecord[], field: keyof StatsRecord): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const r of records) {
    const val = String(r[field] || '').trim();
    if (!val) continue;
    counts.set(val, (counts.get(val) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
