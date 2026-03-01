import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FleetTypeChartProps {
  data: { name: string; count: number }[];
}

const COLORS = ['hsl(207, 100%, 35%)', 'hsl(190, 100%, 50%)'];
const LABELS: Record<string, string> = { PROPRIO: 'Próprio', LOCADO: 'Locado' };

export function FleetTypeChart({ data }: FleetTypeChartProps) {
  const chartData = data.map(d => ({ ...d, name: LABELS[d.name] || d.name }));

  return (
    <div className="glass-panel rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-3" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
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
            contentStyle={{ backgroundColor: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 14%, 25%)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
            formatter={(value: number, name: string) => [`${value} veículos`, name]}
          />
          <Legend
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
