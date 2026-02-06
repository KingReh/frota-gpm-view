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
import { BalanceIndicator } from './BalanceIndicator';
import { VehicleDetailModal } from './VehicleDetailModal';
import type { VehicleWithDetails } from '@/types/vehicle';

interface VehicleTableProps {
  vehicles: VehicleWithDetails[];
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDetails | null>(null);

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">Nenhum veículo encontrado</p>
        <p className="text-sm text-muted-foreground/70">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Placa</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden sm:table-cell">Coordenação</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow
                key={vehicle.plate}
                className="cursor-pointer"
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <TableCell className="font-mono font-semibold">
                  {vehicle.plate}
                </TableCell>
                <TableCell>{vehicle.model || '-'}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {vehicle.fleet_type || '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {vehicle.coordination ? (
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: vehicle.coordination.color,
                        color: vehicle.coordination.font_color,
                      }}
                    >
                      {vehicle.coordination.name}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <BalanceIndicator balance={vehicle.balance} size="sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={!!selectedVehicle}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
      />
    </>
  );
}
