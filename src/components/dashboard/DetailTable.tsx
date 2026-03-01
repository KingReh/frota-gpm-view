import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DetailTableProps {
  title: string;
  columns: { key: string; label: string; align?: 'left' | 'right' | 'center' }[];
  rows: Record<string, string | number>[];
  delay?: number;
}

export function DetailTable({ title, columns, rows, delay = 0 }: DetailTableProps) {
  return (
    <div
      className="glass-panel rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-3"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4">{title}</h3>
      <div className="overflow-x-auto custom-scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              {columns.map(col => (
                <TableHead
                  key={col.key}
                  className={`text-[10px] uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} className="border-white/5 hover:bg-white/[0.02]">
                {columns.map(col => (
                  <TableCell
                    key={col.key}
                    className={`text-sm font-mono whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}
                  >
                    {row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
