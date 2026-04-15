import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, differenceInDays } from 'date-fns';
import type { VehicleMaintenance } from '@/hooks/useVehicleMaintenance';

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
  'Modelo',
  'Tipo Frota',
  'OS',
  'Problemas Identificados',
  'Data Solicitação',
  'Atendimento GAD',
  'Entrada Oficina',
  'Dias na Oficina',
];

function buildRows(records: VehicleMaintenance[]): string[][] {
  return records.map((r) => [
    r.plate,
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

function buildWorkbook(records: VehicleMaintenance[]) {
  const wb = XLSX.utils.book_new();
  const rows = buildRows(records);
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  ws['!cols'] = [
    { wch: 12 },
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

export function exportMaintenanceXLSX(records: VehicleMaintenance[]) {
  const wb = buildWorkbook(records);
  XLSX.writeFile(wb, `manutencao-gpm-${Date.now()}.xlsx`);
}

export function exportMaintenanceODS(records: VehicleMaintenance[]) {
  const wb = buildWorkbook(records);
  XLSX.writeFile(wb, `manutencao-gpm-${Date.now()}.ods`, { bookType: 'ods' });
}

export function exportMaintenancePDF(records: VehicleMaintenance[]) {
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

  const rows = buildRows(records);

  autoTable(doc, {
    startY: 28,
    head: [HEADERS],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 22 },
      3: { halign: 'center', cellWidth: 14 },
      4: { cellWidth: 55 },
      5: { halign: 'center', cellWidth: 24 },
      6: { halign: 'center', cellWidth: 24 },
      7: { halign: 'center', cellWidth: 24 },
      8: { halign: 'center', cellWidth: 22 },
    },
    margin: { left: 10, right: 10 },
  });

  doc.save(`manutencao-gpm-${Date.now()}.pdf`);
}
