import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, differenceInDays } from 'date-fns';
import type { VehicleMaintenance } from '@/hooks/useVehicleMaintenance';

export type CoordinationMap = Record<string, string>;

function formatDate(date: string | null): string {
  if (!date) return '—';
  return format(parseISO(date), 'dd/MM/yyyy');
}

function getDaysLabel(entryDate: string | null): string {
  if (!entryDate) return 'Aguardando';
  const days = differenceInDays(new Date(), parseISO(entryDate));
  return `${days} ${days === 1 ? 'dia' : 'dias'}`;
}

const HEADERS = [
  'Placa',
  'Coordenação',
  'Modelo',
  'Tipo Frota',
  'OS',
  'Problemas Identificados',
  'Data Solicitação',
  'Atendimento GAD',
  'Entrada Oficina',
  'Dias na Oficina',
];

function buildRows(records: VehicleMaintenance[], coordMap: CoordinationMap = {}): string[][] {
  return records.map((r) => [
    r.plate,
    coordMap[r.plate] ?? '—',
    r.model ?? '—',
    r.fleet_type ?? '—',
    r.os_number ? String(r.os_number) : '—',
    r.identified_problems || '—',
    formatDate(r.requested_date),
    formatDate(r.gad_service_date),
    formatDate(r.workshop_entry_date),
    getDaysLabel(r.workshop_entry_date),
  ]);
}

function buildWorkbook(records: VehicleMaintenance[], coordMap: CoordinationMap = {}) {
  const wb = XLSX.utils.book_new();
  const rows = buildRows(records, coordMap);
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
    { wch: 8 },
    { wch: 40 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Manutenção');
  return wb;
}

export function exportMaintenanceXLSX(records: VehicleMaintenance[], coordMap: CoordinationMap = {}) {
  const wb = buildWorkbook(records, coordMap);
  XLSX.writeFile(wb, `manutencao-gpm-${Date.now()}.xlsx`);
}

export function exportMaintenanceODS(records: VehicleMaintenance[], coordMap: CoordinationMap = {}) {
  const wb = buildWorkbook(records, coordMap);
  XLSX.writeFile(wb, `manutencao-gpm-${Date.now()}.ods`, { bookType: 'ods' });
}

export function exportMaintenancePDF(records: VehicleMaintenance[], coordMap: CoordinationMap = {}) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GPM Manutenção', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(
    `${records.length} veículo(s) em manutenção  |  Exportado em ${new Date().toLocaleString('pt-BR')}`,
    pageWidth / 2,
    22,
    { align: 'center' }
  );
  doc.setTextColor(0);

  const rows = buildRows(records, coordMap);

  autoTable(doc, {
    startY: 28,
    head: [HEADERS],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 28 },
      4: { halign: 'center', cellWidth: 12 },
      5: { cellWidth: 50 },
      6: { halign: 'center', cellWidth: 22 },
      7: { halign: 'center', cellWidth: 22 },
      8: { halign: 'center', cellWidth: 22 },
      9: { halign: 'center', cellWidth: 20 },
    },
    margin: { left: 10, right: 10 },
  });

  doc.save(`manutencao-gpm-${Date.now()}.pdf`);
}
