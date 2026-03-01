import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface CoordinationBalanceLineChartProps {
  data: { name: string; color: string; totalBalance: number }[];
}

export function CoordinationBalanceLineChart({ data }: CoordinationBalanceLineChartProps) {
  const sorted = [...data].sort((a, b) => b.totalBalance - a.totalBalance);

  return (
    <div className="glass-panel rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-3" style={{ animationDelay: '700ms', animationFillMode: 'backwards' }}>
      <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4">Saldo por Coordenação</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sorted} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 25%)" />
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
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(215, 20%, 65%)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 14%, 25%)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Saldo']}
            labelStyle={{ color: '#fff', fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey="totalBalance"
            stroke="hsl(207, 100%, 35%)"
            strokeWidth={3}
            dot={{ fill: 'hsl(207, 100%, 35%)', r: 5, strokeWidth: 2, stroke: 'hsl(220, 18%, 13%)' }}
            activeDot={{ r: 7, fill: 'hsl(190, 100%, 50%)' }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
