import { useCallback } from 'react';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import DashboardLayout from '@/components/DashboardLayout';
import KPIDashboard from '@/components/KPIDashboard';
import StatisticsDashboard from '@/components/StatisticsDashboard';
import FinancePlaceholder from '@/components/FinancePlaceholder';

function DashboardContent() {
  const { section } = useDashboard();

  const handleExportCSV = useCallback(() => {
    // Trigger CSV download of current view
    const content = 'data:text/csv;charset=utf-8,Export not implemented yet';
    const link = document.createElement('a');
    link.href = encodeURI(content);
    link.download = `ameen-${section}-export.csv`;
    link.click();
  }, [section]);

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <DashboardLayout onExportCSV={handleExportCSV} onExportPDF={handleExportPDF}>
      {section === 'kpi' && <KPIDashboard />}
      {section === 'statistics' && <StatisticsDashboard />}
      {section === 'finance' && <FinancePlaceholder />}
    </DashboardLayout>
  );
}

export default function Index() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
