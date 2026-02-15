import React, { useState } from 'react';
import { useDashboard, type Section } from '@/contexts/DashboardContext';
import { Sun, Moon, RefreshCw, Download, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ameenLogo from '@/assets/ameen-logo.png';

interface Props {
  children: React.ReactNode;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

const NAV_ITEMS: { key: Section; label: string; disabled?: boolean }[] = [
  { key: 'kpi', label: 'KPI Dashboard' },
  { key: 'statistics', label: 'Statistics' },
  { key: 'finance', label: 'Finance', disabled: true },
];

export default function DashboardLayout({ children, onExportCSV, onExportPDF }: Props) {
  const {
    section, setSection, isDark, toggleTheme,
    currency, setCurrency, exchangeRate, setExchangeRate,
    triggerRefresh, lastUpdated,
  } = useDashboard();
  const [rateInput, setRateInput] = useState(String(exchangeRate));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 no-print">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <img src={ameenLogo} alt="Ameen Care" className="h-9" />
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 rounded-lg bg-muted p-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => !item.disabled && setSection(item.key)}
                disabled={item.disabled}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  section === item.key
                    ? 'bg-card text-foreground shadow-sm'
                    : item.disabled
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
                {item.disabled && (
                  <span className="ml-1 text-[10px] font-semibold gradient-brand text-primary-foreground px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Mobile nav */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {NAV_ITEMS.find(n => n.key === section)?.label} <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {NAV_ITEMS.map(item => (
                  <DropdownMenuItem
                    key={item.key}
                    disabled={item.disabled}
                    onClick={() => !item.disabled && setSection(item.key)}
                  >
                    {item.label} {item.disabled && '(Coming Soon)'}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Currency Toggle */}
            <div className="flex items-center rounded-md bg-muted p-0.5 text-xs">
              <button
                onClick={() => setCurrency('SAR')}
                className={`px-2 py-1 rounded transition-all font-medium ${
                  currency === 'SAR' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                SAR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded transition-all font-medium ${
                  currency === 'USD' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                USD
              </button>
            </div>

            {/* Exchange Rate Settings */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xs">
                <DialogHeader>
                  <DialogTitle>Exchange Rate</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">1 USD =</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={rateInput}
                    onChange={e => setRateInput(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">SAR</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      const v = parseFloat(rateInput);
                      if (v > 0) setExchangeRate(v);
                    }}
                  >
                    Set
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Theme */}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportCSV} disabled={section === 'finance'}>
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportPDF} disabled={section === 'finance'}>
                  Export PDF (Print)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh */}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={triggerRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mx-auto max-w-[1440px] px-4 pt-2 no-print">
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-[1440px] px-4 py-6">
        {children}
      </main>
    </div>
  );
}
