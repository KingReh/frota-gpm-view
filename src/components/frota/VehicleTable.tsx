import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VehicleDetailModal } from './VehicleDetailModal';
import { CoordinationBadge } from './CoordinationBadge';
import type { VehicleWithDetails } from '@/types/vehicle';
import { cn } from '@/lib/utils';
import { parseBalance } from '@/lib/balance';
import { motion } from 'framer-motion';
import { Info, Building2, Car, LayoutList, Grid, MonitorPlay, Star } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface VehicleTableProps {
  vehicles: VehicleWithDetails[];
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDetails | null>(null);
  const { preferences, toggleFavorite } = useUserPreferences();

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center glass-panel rounded-[32px] border border-white/10 bg-black/40 backdrop-blur-xl mx-4">
        <div className="p-8 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Car className="w-12 h-12 text-primary opacity-50" />
        </div>
        <p className="text-xl font-bold text-white tracking-tight">Vazio técnico</p>
        <p className="text-sm text-zinc-500 mt-2">Nenhum registro encontrado para estes parâmetros</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel rounded-2xl overflow-hidden backdrop-blur-xl border border-white/10 bg-black/20 shadow-2xl mx-1 md:mx-0">
        <div className="overflow-x-auto scrollbar-hide">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent bg-white/5">
                <TableHead className="w-[112px] md:w-[144px] text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 py-6 pl-4 md:pl-8">Placa</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 py-6 px-4 md:px-0">Modelo</TableHead>
                <TableHead className="hidden lg:table-cell text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 py-6">Concessionária</TableHead>
                <TableHead className="hidden md:table-cell text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 py-6">Tipo</TableHead>
                <TableHead className="hidden sm:table-cell text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 py-6">Unidade</TableHead>
                <TableHead className="hidden xl:table-cell text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 py-6 text-right">Limite Próx. Período</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 py-6 pr-4 md:pr-8">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle, index) => (
                <motion.tr
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02, type: "spring", stiffness: 100 }}
                  key={vehicle.plate}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-all group relative"
                >
                  <TableCell className="pl-4 md:pl-8 py-3 md:py-4 relative">
                    {/* Horizontal row highlight line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-primary rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-6 w-6 rounded-md transition-all shrink-0",
                          preferences.favoritePlates?.includes(vehicle.plate)
                            ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                            : "text-zinc-600 hover:text-yellow-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100" // Hide until hover for cleaner look
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(vehicle.plate);
                        }}
                      >
                        <Star className={cn("h-3.5 w-3.5", preferences.favoritePlates?.includes(vehicle.plate) && "fill-current")} />
                      </Button>

                      <div className="bg-white/5 border border-white/10 px-2 md:px-4 py-1.5 rounded text-white font-mono font-bold tracking-widest text-[11px] md:text-sm shadow-inner group-hover:border-primary/40 transition-colors inline-block">
                        {vehicle.plate}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 md:py-4 px-4 md:px-0">
                    <span className="text-[11px] md:text-sm font-bold text-white/90 group-hover:text-white transition-colors truncate max-w-[72px] md:max-w-none block">
                      {vehicle.model || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Building2 className="w-3.5 h-3.5 opacity-50" />
                      <span className="text-[11px] font-medium truncate max-w-[120px]">
                        {vehicle.manufacturer || 'Não informado'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-4">
                    <Badge variant="outline" className="border-white/5 bg-white/5 text-[9px] uppercase tracking-wider text-zinc-400">
                      {vehicle.fleet_type || 'Geral'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-4">
                    {vehicle.coordination ? (
                      <CoordinationBadge coordination={vehicle.coordination} />
                    ) : (
                      <span className="text-zinc-600 text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell py-4 text-right font-mono text-[11px] text-zinc-500">
                    {vehicle.next_period_limit ? (
                      <span className="text-zinc-400 font-bold">
                        {parseBalance(vehicle.next_period_limit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right py-2 md:py-4 pr-4 md:pr-8">
                    <div className="flex items-center justify-end gap-3">
                      <div className="inline-flex items-center gap-2 md:gap-4">
                        <span className="font-mono font-black text-[11px] md:text-sm text-white tracking-tight">
                          {parseBalance(vehicle.balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <div className="h-1 w-1 md:h-2 md:w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,45,32,0.8)] animate-pulse hidden xs:block" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:h-10 md:w-10 text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg md:rounded-xl transition-all"
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        <Info className="h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={!!selectedVehicle}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
      />
    </>
  );
}
