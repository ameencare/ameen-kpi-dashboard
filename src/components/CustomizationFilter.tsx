import { useDashboard, type PeriodType, type CustomComparison } from '@/contexts/DashboardContext';
import { Settings2, ChevronDown, Info } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

const PERIOD_OPTIONS: { key: PeriodType; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];

const YEARS = [2024, 2025, 2026];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Get the Sunday that starts the business year
function getYearStartSunday(year: number): Date {
  const jan1 = new Date(year, 0, 1);
  const day = jan1.getDay();
  // First Sunday of the year
  const offset = day === 0 ? 0 : 7 - day;
  return new Date(year, 0, 1 + offset);
}

// Get last completed week number for a given year
function getLastCompletedWeek(year: number): number {
  const now = new Date();
  const yearStart = getYearStartSunday(year);
  
  // Current Saturday end
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (today < yearStart) return 0;
  
  const diffMs = today.getTime() - yearStart.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const currentWeek = Math.floor(diffDays / 7) + 1;
  
  // A week is completed if Saturday has passed
  const dayOfWeek = today.getDay(); // 0=Sun
  const completedWeek = dayOfWeek === 6 ? currentWeek : currentWeek - 1;
  
  return Math.min(Math.max(completedWeek, 0), 52);
}

function getLastCompletedMonth(year: number): number {
  const now = new Date();
  if (now.getFullYear() < year) return 0;
  if (now.getFullYear() > year) return 12;
  
  // A month is completed when its last Saturday has passed
  const currentMonth = now.getMonth() + 1; // 1-12
  // Check if current month's last Saturday has passed
  const lastDayOfMonth = new Date(year, currentMonth, 0);
  const lastSaturday = new Date(lastDayOfMonth);
  lastSaturday.setDate(lastDayOfMonth.getDate() - ((lastDayOfMonth.getDay() + 1) % 7));
  
  if (now >= lastSaturday) return currentMonth;
  return currentMonth - 1;
}

function getLastCompletedQuarter(year: number): number {
  const lastMonth = getLastCompletedMonth(year);
  return Math.floor((lastMonth - 1) / 3);
}

function isYearCompleted(year: number): boolean {
  const now = new Date();
  return now.getFullYear() > year;
}

interface SelectDropdownProps {
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string; disabled: boolean }[];
  disabledValue?: number;
  label: string;
}

function SelectDropdown({ value, onChange, options, disabledValue, label }: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative">
      <label className="block text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full min-w-[120px] px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground hover:border-primary/40 transition-colors"
      >
        <span className={selected?.disabled ? 'text-muted-foreground' : ''}>{selected?.label || 'Select'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-2" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg animate-fade-in">
          {options.map(opt => (
            <button
              key={opt.value}
              disabled={opt.disabled || opt.value === disabledValue}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`block w-full text-left px-3 py-1.5 text-sm transition-colors ${
                opt.disabled || opt.value === disabledValue
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : opt.value === value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              {opt.label}
              {opt.disabled && <span className="ml-1 text-[10px]">(ongoing)</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomizationFilter() {
  const { customComparison, setCustomComparison, setPeriodType } = useDashboard();
  const [expanded, setExpanded] = useState(customComparison.enabled);

  const toggleCustomization = useCallback(() => {
    const next = !expanded;
    setExpanded(next);
    if (!next) {
      setCustomComparison({ ...customComparison, enabled: false });
    } else {
      setCustomComparison({ ...customComparison, enabled: true });
    }
  }, [expanded, customComparison, setCustomComparison]);

  const updateField = useCallback(<K extends keyof CustomComparison>(key: K, val: CustomComparison[K]) => {
    const updated = { ...customComparison, [key]: val };
    setCustomComparison(updated);
    if (key === 'periodType') {
      setPeriodType(val as PeriodType);
    }
  }, [customComparison, setCustomComparison, setPeriodType]);

  // Generate period options based on type
  const periodOptions = useMemo(() => {
    const pt = customComparison.periodType;
    
    const makeOptions = (year: number) => {
      if (pt === 'weekly') {
        const lastCompleted = getLastCompletedWeek(year);
        return Array.from({ length: 52 }, (_, i) => ({
          value: i + 1,
          label: `Week ${i + 1}`,
          disabled: new Date().getFullYear() === year && i + 1 > lastCompleted,
        }));
      }
      if (pt === 'monthly') {
        const lastCompleted = getLastCompletedMonth(year);
        return MONTHS.map((m, i) => ({
          value: i + 1,
          label: m,
          disabled: new Date().getFullYear() === year && i + 1 > lastCompleted,
        }));
      }
      if (pt === 'quarterly') {
        const lastCompleted = getLastCompletedQuarter(year);
        return [1, 2, 3, 4].map(q => ({
          value: q,
          label: `Q${q}`,
          disabled: new Date().getFullYear() === year && q > lastCompleted,
        }));
      }
      // yearly
      return YEARS.map(y => ({
        value: y,
        label: `${y}`,
        disabled: !isYearCompleted(y),
      }));
    };

    return {
      options1: makeOptions(customComparison.year1),
      options2: makeOptions(customComparison.year2),
    };
  }, [customComparison.periodType, customComparison.year1, customComparison.year2]);

  const yearOptions = YEARS.map(y => ({ value: y, label: `${y}`, disabled: false }));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-300">
      {/* Toggle Header */}
      <button
        onClick={toggleCustomization}
        className={`flex items-center gap-2 w-full px-4 py-3 text-sm font-medium transition-colors ${
          expanded ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <Settings2 className="h-4 w-4" />
        <span>Customization</span>
        <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Panel */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-border pt-4">
          {/* Period Type Selector */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">Period Type</p>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {PERIOD_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => updateField('periodType', opt.key)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    customComparison.periodType === opt.key
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Year Comparison */}
          {customComparison.periodType !== 'yearly' && (
            <div className="grid grid-cols-2 gap-3">
              <SelectDropdown
                label="Year (Current)"
                value={customComparison.year1}
                onChange={v => updateField('year1', v)}
                options={yearOptions}
              />
              <SelectDropdown
                label="Year (Previous)"
                value={customComparison.year2}
                onChange={v => updateField('year2', v)}
                options={yearOptions}
              />
            </div>
          )}

          {/* Dynamic Period Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <SelectDropdown
              label={customComparison.periodType === 'yearly' ? 'Current Year' : 'Current Period'}
              value={customComparison.period1}
              onChange={v => updateField('period1', v)}
              options={periodOptions.options1}
              disabledValue={
                customComparison.year1 === customComparison.year2 ? customComparison.period2 : undefined
              }
            />
            <SelectDropdown
              label={customComparison.periodType === 'yearly' ? 'Previous Year' : 'Previous Period'}
              value={customComparison.period2}
              onChange={v => updateField('period2', v)}
              options={periodOptions.options2}
              disabledValue={
                customComparison.year1 === customComparison.year2 ? customComparison.period1 : undefined
              }
            />
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Only completed periods are selectable. Ongoing weeks/months/quarters are disabled.</span>
          </div>
        </div>
      )}
    </div>
  );
}