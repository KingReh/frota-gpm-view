import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FleetTypeChartProps {
  data: { name: string; count: number }[];
}

const COLORS = ['hsl(207, 100%, 35%)', 'hsl(190, 100%, 50%)'];
const LABELS: Record<string, string> = { PROPRIO: 'Próprio', LOCADO: 'Locado' };

export function FleetTypeChart({ data }: FleetTypeChartProps) {
  const chartData = data.map(d => ({ ...d, name: LABELS[d.name] || d.name }));

  return (
    <div data-chart-export className="glass-panel rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-3" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
      <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4">Tipo de Frota</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="count"
            animationBegin={0}
            animationDuration={800}
            stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px', color: 'hsl(var(--popover-foreground))' }}
            formatter={(value: number, name: string) => {
              const idx = chartData.findIndex(d => d.name === name);
              const color = COLORS[idx >= 0 ? idx % COLORS.length : 0];
              return [<span style={{ color }}>{value} veículos</span>];
            }}
            labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 600 }}
            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
          />
          <Legend
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
