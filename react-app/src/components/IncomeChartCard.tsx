import { useState, useMemo } from 'react';
import { StudioIcon } from '../pages/shared';
import { CustomDropdown } from './CustomDropdown';
import { IncomeChart } from './IncomeChart';
import type { Invoice } from '../api/types';

export function IncomeChartCard({ invoices, isCollapsible = false }: { invoices: Invoice[], isCollapsible?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(isCollapsible);
  const [chartTimeRange, setChartTimeRange] = useState<string>('ytd');
  const [customChartFrom, setCustomChartFrom] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customChartTo, setCustomChartTo] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const { chartData, uniqueClients } = useMemo(() => {
    const now = new Date();
    let startTs: number;
    let endTs = now.getTime();

    if (chartTimeRange === '1m') {
      startTs = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
    } else if (chartTimeRange === '2m') {
      startTs = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()).getTime();
    } else if (chartTimeRange === '3m') {
      startTs = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime();
    } else if (chartTimeRange === '6m') {
      startTs = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();
    } else if (chartTimeRange === 'ytd') {
      startTs = new Date(now.getFullYear(), 0, 1).getTime();
    } else {
      startTs = new Date(customChartFrom).getTime();
      endTs = new Date(customChartTo).getTime() + 86399999;
    }

    const filtered = invoices.filter(inv => {
      const t = new Date(inv.date).getTime();
      return t >= startTs && t <= endTs;
    });

    const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const grouped = sorted.reduce((acc, inv) => {
      const dateObj = new Date(inv.date);
      const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[monthStr]) acc[monthStr] = { name: monthStr, timestamp: dateObj.getTime() };
      
      const rawName = inv.customerName;
      const client = rawName.length > 12 ? rawName.substring(0, 12) + '...' : rawName;
      const isActual = inv.status === 'Paid' || inv.status === 'Fulfilled';
      const key = `${client} (${isActual ? 'Actual' : 'Predicted'})`;
      
      acc[monthStr][key] = (acc[monthStr][key] || 0) + inv.totalAmount;
      return acc;
    }, {} as Record<string, any>);

    const dataArray = Object.values(grouped).sort((a: any, b: any) => a.timestamp - b.timestamp);
    const clients = Array.from(new Set(filtered.map(i => {
      const rawName = i.customerName;
      return rawName.length > 12 ? rawName.substring(0, 12) + '...' : rawName;
    })));
    
    return { chartData: dataArray, uniqueClients: clients };
  }, [invoices, chartTimeRange, customChartFrom, customChartTo]);

  return (
    <div className="metric-card span-2 chart-card" style={{ padding: '24px' }}>
      <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '-8px', flexWrap: 'wrap', gap: '12px' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isCollapsible ? 'pointer' : 'default', userSelect: 'none' }}
          onClick={() => isCollapsible && setIsCollapsed(!isCollapsed)}
        >
          {isCollapsible && (
            <StudioIcon name={isCollapsed ? 'keyboard_arrow_right' : 'keyboard_arrow_down'} />
          )}
          <StudioIcon name="show_chart" />
          <span>Income Over Time</span>
        </div>
        {!isCollapsed && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {chartTimeRange === 'custom' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div className="custom-chart-date">
                  <span>
                    {customChartFrom ? new Date(customChartFrom).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'From'}
                  </span>
                  <StudioIcon name="calendar_month" />
                  <input
                    type="date"
                    value={customChartFrom}
                    onChange={(e) => setCustomChartFrom(e.target.value)}
                  />
                </div>
                <div className="custom-chart-date">
                  <span>
                    {customChartTo ? new Date(customChartTo).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'To'}
                  </span>
                  <StudioIcon name="calendar_month" />
                  <input
                    type="date"
                    value={customChartTo}
                    onChange={(e) => setCustomChartTo(e.target.value)}
                  />
                </div>
              </div>
            )}
            <CustomDropdown 
              value={chartTimeRange}
              onChange={(val) => setChartTimeRange(val)}
              className="chart-time-dropdown"
              options={[
                { label: 'Last Month', value: '1m' },
                { label: 'Last 2 Months', value: '2m' },
                { label: 'Last 3 Months', value: '3m' },
                { label: 'Last 6 Months', value: '6m' },
                { label: 'Year to Date', value: 'ytd' },
                { label: 'Custom Range', value: 'custom' },
              ]}
            />
          </div>
        )}
      </div>
      {!isCollapsed && (
        <IncomeChart data={chartData} clients={uniqueClients} />
      )}
    </div>
  );
}
