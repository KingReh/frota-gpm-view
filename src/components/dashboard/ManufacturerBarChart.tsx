import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ManufacturerBarChartProps {
  data: { name: string; count: number }[];
}

export function ManufacturerBarChart({ data }: ManufacturerBarChartProps) {
  return (
    <div className="glass-panel rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-3" style={{ animationDelay: '600ms', animationFillMode: 'backwards' }}>
      <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4">Fabricantes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: 'hsl(215, 20%, 65%)' }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 20%, 65%)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 14%, 25%)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
            formatter={(value: number) => [`${value} veículos`]}
            labelStyle={{ color: '#fff', fontWeight: 600 }}
          />
          <Bar dataKey="count" fill="hsl(190, 100%, 50%)" radius={[6, 6, 0, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
