import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Section = 'kpi' | 'statistics' | 'finance';
export type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type Currency = 'SAR' | 'USD';

interface DashboardContextType {
  section: Section;
  setSection: (s: Section) => void;
  periodType: PeriodType;
  setPeriodType: (p: PeriodType) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRate: number;
  setExchangeRate: (r: number) => void;
  isDark: boolean;
  toggleTheme: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
  lastUpdated: Date | null;
  setLastUpdated: (d: Date) => void;
  convertAmount: (sarAmount: number) => number;
  formatCurrency: (sarAmount: number) => string;
  formatValue: (value: number, type: 'number' | 'percentage' | 'currency' | 'ratio') => string;
  drilldownMetric: string | null;
  setDrilldownMetric: (m: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType>(null!);
export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [section, setSection] = useState<Section>('kpi');
  const [periodType, setPeriodType] = useState<PeriodType>('weekly');
  const [currency, setCurrency] = useState<Currency>('SAR');
  const [exchangeRate, setExchangeRate] = useState(3.75);
  const [isDark, setIsDark] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [drilldownMetric, setDrilldownMetric] = useState<string | null>(null);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }, []);

  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const convertAmount = useCallback((sarAmount: number) => {
    return currency === 'SAR' ? sarAmount : sarAmount / exchangeRate;
  }, [currency, exchangeRate]);

  const formatCurrency = useCallback((sarAmount: number) => {
    const amount = convertAmount(sarAmount);
    const sym = currency === 'SAR' ? 'SAR' : 'USD';
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${sym}`;
  }, [convertAmount, currency]);

  const formatValue = useCallback((value: number, type: 'number' | 'percentage' | 'currency' | 'ratio') => {
    if (type === 'percentage') return `${value.toFixed(0)}%`;
    if (type === 'currency') return formatCurrency(value);
    if (type === 'ratio') return value.toFixed(1);
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }, [formatCurrency]);

  useEffect(() => {
    const interval = setInterval(triggerRefresh, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [triggerRefresh]);

  return (
    <DashboardContext.Provider value={{
      section, setSection, periodType, setPeriodType,
      currency, setCurrency, exchangeRate, setExchangeRate,
      isDark, toggleTheme, refreshKey, triggerRefresh,
      lastUpdated, setLastUpdated, convertAmount, formatCurrency, formatValue,
      drilldownMetric, setDrilldownMetric,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};
