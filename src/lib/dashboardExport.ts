import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DashboardData } from '@/hooks/useDashboardData';

interface ExportOptions {
  dashboard: Omit<DashboardData, 'isLoading'>;
  filterLabel: string;
}

function buildWorkbook(opts: ExportOptions) {
  const { dashboard, filterLabel } = opts;
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumo
  const summaryData = [
    ['Painel de Inteligência - Frota'],
    ['Filtro aplicado:', filterLabel],
    ['Data de exportação:', new Date().toLocaleString('pt-BR')],
    [],
    ['Métrica', 'Valor'],
    ['Total de Veículos', dashboard.totalVehicles],
    ['Próprios', dashboard.ownedCount],
    ['Locados', dashboard.rentedCount],
    ['Modelos Distintos', dashboard.distinctModels],
    ['Tipos de Combustível', dashboard.distinctFuelTypes],
    ['Fabricantes Distintos', dashboard.distinctManufacturers],
    ['Saldo Zero', dashboard.zeroBalanceCount],
    ['Saldo Positivo', dashboard.positiveBalanceCount],
  ];
  const wsResumo = XLSX.utils.aoa_to_sheet(summaryData);
  wsResumo['!cols'] = [{ wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

  // Sheet 2: Coordenações
  const coordHeader = ['Coordenação', 'Veículos', 'Saldo Total (R$)'];
  const coordRows = dashboard.byCoordination.map(c => [
    c.name,
    c.count,
    c.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
  ]);
  const wsCoord = XLSX.utils.aoa_to_sheet([coordHeader, ...coordRows]);
  wsCoord['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsCoord, 'Coordenações');

  // Sheet 3: Saldo por Veículo
  const balHeader = ['Unidade', 'Placa', 'Saldo Atual'];
  const balRows = dashboard.vehicleBalances.map(v => [
    v.coordination,
    v.plate,
    v.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
  ]);
  const wsBal = XLSX.utils.aoa_to_sheet([balHeader, ...balRows]);
  wsBal['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsBal, 'Saldo por Veículo');

  // Sheet 4: Tipo de Frota
  const fleetHeader = ['Tipo de Frota', 'Quantidade'];
  const fleetRows = dashboard.byFleetType.map(f => [f.name, f.count]);
  const wsFleet = XLSX.utils.aoa_to_sheet([fleetHeader, ...fleetRows]);
  wsFleet['!cols'] = [{ wch: 20 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsFleet, 'Tipo de Frota');

  // Sheet 5: Combustível
  const fuelHeader = ['Combustível', 'Quantidade'];
  const fuelRows = dashboard.byFuelType.map(f => [f.name, f.count]);
  const wsFuel = XLSX.utils.aoa_to_sheet([fuelHeader, ...fuelRows]);
  wsFuel['!cols'] = [{ wch: 20 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsFuel, 'Combustível');

  // Sheet 6: Modelos
  const modelHeader = ['Modelo', 'Quantidade'];
  const modelRows = dashboard.byModel.map(m => [m.name, m.count]);
  const wsModel = XLSX.utils.aoa_to_sheet([modelHeader, ...modelRows]);
  wsModel['!cols'] = [{ wch: 30 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsModel, 'Modelos');

  // Sheet 7: Fabricantes
  const mfrHeader = ['Fabricante', 'Quantidade'];
  const mfrRows = dashboard.byManufacturer.map(m => [m.name, m.count]);
  const wsMfr = XLSX.utils.aoa_to_sheet([mfrHeader, ...mfrRows]);
  wsMfr['!cols'] = [{ wch: 25 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsMfr, 'Fabricantes');

  return wb;
}

export function exportToXLSX(opts: ExportOptions) {
  const wb = buildWorkbook(opts);
  XLSX.writeFile(wb, `dashboard-frota-${Date.now()}.xlsx`);
}

export function exportToODS(opts: ExportOptions) {
  const wb = buildWorkbook(opts);
  XLSX.writeFile(wb, `dashboard-frota-${Date.now()}.ods`, { bookType: 'ods' });
}

export async function exportToPDF(opts: ExportOptions) {
  const { dashboard, filterLabel } = opts;
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Painel de Inteligência - Frota', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(`Filtro: ${filterLabel}  |  Exportado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 22, { align: 'center' });
  doc.setTextColor(0);

  // Summary cards
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo', 14, 32);

  autoTable(doc, {
    startY: 35,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total de Veículos', String(dashboard.totalVehicles)],
      ['Próprios', String(dashboard.ownedCount)],
      ['Locados', String(dashboard.rentedCount)],
      ['Modelos Distintos', String(dashboard.distinctModels)],
      ['Tipos de Combustível', String(dashboard.distinctFuelTypes)],
      ['Fabricantes Distintos', String(dashboard.distinctManufacturers)],
      ['Saldo Zero', String(dashboard.zeroBalanceCount)],
      ['Saldo Positivo', String(dashboard.positiveBalanceCount)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: pageWidth / 2 + 5 },
  });

  // Coordenações table (right side)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Coordenações', pageWidth / 2 + 5, 32);

  autoTable(doc, {
    startY: 35,
    head: [['Coordenação', 'Veículos', 'Saldo Total (R$)']],
    body: dashboard.byCoordination.map(c => [
      c.name,
      String(c.count),
      c.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    margin: { left: pageWidth / 2 + 5, right: 14 },
  });

  // Page 2: Fleet type + Fuel type
  doc.addPage();

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo de Frota', 14, 15);

  autoTable(doc, {
    startY: 18,
    head: [['Tipo', 'Quantidade']],
    body: dashboard.byFleetType.map(f => [f.name, String(f.count)]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: pageWidth / 2 + 5 },
  });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Combustível', pageWidth / 2 + 5, 15);

  autoTable(doc, {
    startY: 18,
    head: [['Combustível', 'Quantidade']],
    body: dashboard.byFuelType.map(f => [f.name, String(f.count)]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: pageWidth / 2 + 5, right: 14 },
  });

  // Page 3: Models + Manufacturers
  doc.addPage();

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Modelos', 14, 15);

  autoTable(doc, {
    startY: 18,
    head: [['Modelo', 'Quantidade']],
    body: dashboard.byModel.map(m => [m.name, String(m.count)]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: pageWidth / 2 + 5 },
  });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Fabricantes', pageWidth / 2 + 5, 15);

  autoTable(doc, {
    startY: 18,
    head: [['Fabricante', 'Quantidade']],
    body: dashboard.byManufacturer.map(m => [m.name, String(m.count)]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: pageWidth / 2 + 5, right: 14 },
  });

  // Page 4: Saldo por Veículo
  doc.addPage();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Saldo por Veículo', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(`Total de veículos: ${dashboard.vehicleBalances.length}`, pageWidth / 2, 21, { align: 'center' });
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 25,
    head: [['Unidade', 'Placa', 'Saldo Atual (R$)']],
    body: dashboard.vehicleBalances.map(v => [
      v.coordination,
      v.plate,
      v.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 2: { halign: 'right' } },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      // Highlight zero/negative balances in red
      if (data.section === 'body' && data.column.index === 2) {
        const raw = dashboard.vehicleBalances[data.row.index];
        if (raw && raw.balance <= 0) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Page 5+: Capture charts as images
  try {
    const chartPanels = document.querySelectorAll<HTMLElement>('[data-chart-export]');

    if (chartPanels.length > 0) {
      // 1) Wait for animations and rendering to fully complete
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 500));

      const html2canvas = (await import('html2canvas')).default;

      // 2) Pre-convert all SVGs to inline canvas for reliable capture
      const svgReplacements: { parent: HTMLElement; canvas: HTMLCanvasElement; original: SVGSVGElement }[] = [];

      for (const panel of chartPanels) {
        const svgs = panel.querySelectorAll<SVGSVGElement>('svg');
        for (const svg of svgs) {
          try {
            const rect = svg.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;

            // Inline all computed styles into the SVG elements
            const inlineStyles = (el: Element) => {
              const computed = window.getComputedStyle(el);
              const htmlEl = el as HTMLElement;
              const stylesToCopy = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray',
                'font-size', 'font-family', 'font-weight', 'opacity', 'color',
                'text-anchor', 'dominant-baseline', 'visibility', 'display'];
              stylesToCopy.forEach(prop => {
                const val = computed.getPropertyValue(prop);
                if (val) htmlEl.style.setProperty(prop, val);
              });
              Array.from(el.children).forEach(child => inlineStyles(child));
            };
            inlineStyles(svg);

            // Serialize SVG to a data URL and draw onto a canvas
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.width = rect.width * 2;
            img.height = rect.height * 2;

            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('SVG image load failed'));
              img.src = url;
            });

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = rect.width * 2;
            tempCanvas.height = rect.height * 2;
            const ctx = tempCanvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#0f1729';
              ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
              ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            }
            URL.revokeObjectURL(url);

            // Replace SVG with canvas in the DOM temporarily
            tempCanvas.style.width = `${rect.width}px`;
            tempCanvas.style.height = `${rect.height}px`;
            svg.parentElement?.insertBefore(tempCanvas, svg);
            svg.style.display = 'none';
            svgReplacements.push({ parent: svg.parentElement as HTMLElement, canvas: tempCanvas, original: svg });
          } catch {
            // Skip this SVG if conversion fails
          }
        }
      }

      // 3) Now capture each panel with html2canvas (SVGs already replaced by canvas)
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Gráficos', pageWidth / 2, 15, { align: 'center' });

      let yOffset = 22;
      const maxWidth = (pageWidth - 28) / 2;
      let col = 0;

      // Inject temporary style fix for html2canvas quirks
      const tempStyle = document.createElement('style');
      tempStyle.textContent = 'body > div:last-child img { display: inline-block; }';
      document.head.appendChild(tempStyle);

      for (const panel of chartPanels) {
        const rect = panel.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const canvas = await html2canvas(panel, {
          backgroundColor: '#0f1729',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          windowHeight: panel.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const ratio = canvas.height / canvas.width;
        const imgWidth = maxWidth;
        const imgHeight = imgWidth * ratio;

        const xPos = col === 0 ? 14 : pageWidth / 2 + 5;

        if (yOffset + imgHeight > pageHeight - 10) {
          doc.addPage();
          yOffset = 15;
          col = 0;
        }

        doc.addImage(imgData, 'PNG', xPos, yOffset, imgWidth, imgHeight);

        if (col === 1) {
          yOffset += imgHeight + 8;
          col = 0;
        } else {
          col = 1;
        }
      }

      // Cleanup: remove temp style and restore SVGs
      tempStyle.remove();
      for (const { canvas, original } of svgReplacements) {
        original.style.display = '';
        canvas.remove();
      }
    }
  } catch (err) {
    console.warn('Não foi possível capturar gráficos para o PDF:', err);
  }

  doc.save(`dashboard-frota-${Date.now()}.pdf`);
}
