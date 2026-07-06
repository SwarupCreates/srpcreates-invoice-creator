import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PREDEFINED_COLORS = [
  '#4a90e2', // Blue
  '#50e3c2', // Teal
  '#f5a623', // Orange
  '#b8e986', // Lime Green
  '#bd10e0', // Purple
  '#ff4a4a', // Red
  '#f8e71c', // Yellow
];

interface IncomeChartProps {
  data: any[];
  clients: string[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip" style={{
        background: 'rgba(26, 26, 26, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '16px',
        padding: '12px',
        minWidth: '160px'
      }}>
        <p style={{ margin: '0 0 12px 0', fontWeight: 650, color: 'var(--text)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '8px' }}>
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', color: entry.color, fontSize: '16px', fontWeight: 650 }}>
            <span style={{ marginRight: '16px' }}>{entry.name}</span>
            <span>{entry.value.toLocaleString()} INR</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ clients }: any) => {
  return (
    <div className="custom-chart-legend" style={{ display: 'flex', justifyContent: 'space-between', gap: '64px', marginTop: '24px', alignItems: 'flex-start', paddingBottom: '0px', marginLeft: '24px', marginBottom: '-20px' }}>
      <div className="legend-clients" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, flex: 1 }}>
        {clients.map((client: string, idx: number) => {
          const color = PREDEFINED_COLORS[idx % PREDEFINED_COLORS.length];
          return (
            <div key={client} style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
              <span style={{ width: '18px', height: '18px', flexShrink: 0, borderRadius: '50%', backgroundColor: color }} />
              <span style={{ color: color, fontSize: '16px', fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client}</span>
            </div>
          );
        })}
      </div>
      
      <div className="legend-styles" style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)', fontSize: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end' }}>
          <span>Received</span>
          <svg width="32" height="4" viewBox="0 0 32 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="2" x2="32" y2="2" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end' }}>
          <span>Predicted</span>
          <svg width="32" height="4" viewBox="0 0 32 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="2" x2="32" y2="2" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export function IncomeChart({ data, clients }: IncomeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ width: '100%', height: '400px', marginTop: '-12px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 10,
            left: -20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="var(--text-muted)" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
            tickMargin={16} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="var(--text-muted)" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
            tickMargin={16} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
          <Legend content={<CustomLegend clients={clients} />} />
          
          {clients.map((client, idx) => {
            const color = PREDEFINED_COLORS[idx % PREDEFINED_COLORS.length];
            return (
              <React.Fragment key={client}>
                {/* Actual Income - Solid Line */}
                <Line
                  type="monotone"
                  dataKey={`${client} (Actual)`}
                  name={`${client} (Actual)`}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: 'var(--panel-deep)' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                  connectNulls
                />
                {/* Predicted Income - Dashed Line */}
                <Line
                  type="monotone"
                  dataKey={`${client} (Predicted)`}
                  name={`${client} (Predicted)`}
                  stroke={color}
                  strokeWidth={3}
                  strokeDasharray="6 6"
                  dot={{ r: 4, strokeWidth: 2, fill: 'var(--panel-deep)' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                  connectNulls
                />
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
