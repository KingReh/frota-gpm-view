import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FuelTypeChartProps {
  data: { name: string; count: number }[];
}

const COLORS = [
  'hsl(207, 100%, 35%)',
  'hsl(207, 80%, 50%)',
  'hsl(207, 60%, 65%)',
  'hsl(190, 100%, 50%)',
  'hsl(190, 70%, 40%)',
];

export function FuelTypeChart({ data }: FuelTypeChartProps) {
  return (
    <div data-chart-export className="glass-panel rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-3" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
      <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4">Tipo de Combustível</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
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
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 14%, 25%)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
            formatter={(value: number, name: string) => {
              const idx = data.findIndex(d => d.name === name);
              const color = COLORS[idx >= 0 ? idx % COLORS.length : 0];
              return [<span style={{ color }}>{value} veículos</span>];
            }}
            labelStyle={{ color: '#fff', fontWeight: 600 }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend
            formatter={(value, entry) => {
              const color = COLORS[(data.findIndex(d => d.name === value)) % COLORS.length] || entry?.color;
              return <span className="text-xs" style={{ color }}>{value}</span>;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
