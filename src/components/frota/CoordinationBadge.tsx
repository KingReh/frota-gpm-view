import { cn } from '@/lib/utils';
import type { Coordination } from '@/types/vehicle';

interface CoordinationBadgeProps {
  coordination: Coordination;
  className?: string;
  compact?: boolean;
}

function getContrastColor(hexColor?: string): string {
  if (!hexColor) return '#ffffff';
  const cleanHex = hexColor.replace('#', '').trim();
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map((c) => c + c).join('')
    : cleanHex;
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#ffffff';
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? '#09090b' : '#ffffff';
}

export function CoordinationBadge({ coordination, className, compact = false }: CoordinationBadgeProps) {
  if (!coordination) return null;

  const coordName = typeof coordination === 'object' && coordination !== null
    ? (typeof coordination.name === 'string' ? coordination.name : '')
    : typeof coordination === 'string'
    ? coordination
    : '';

  const coordColor = typeof coordination === 'object' && coordination !== null && typeof coordination.color === 'string'
    ? coordination.color
    : '#3b82f6';

  const fontColor = typeof coordination === 'object' && coordination !== null && typeof coordination.font_color === 'string'
    ? coordination.font_color.trim()
    : '';

  const textColor = fontColor || getContrastColor(coordColor);
  const isDarkText = textColor === '#000000' || textColor === '#09090b' || textColor.toLowerCase() === 'black';

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-black uppercase tracking-wider select-none shrink-0",
        "rounded-[6px] transition-all duration-200 hover:brightness-110 hover:scale-[1.03] active:scale-95",
        compact
          ? "text-[9px] sm:text-[10px] px-2 py-0.5 leading-tight"
          : "text-[10px] sm:text-xs px-2.5 py-1 leading-none",
        className
      )}
      style={{
        backgroundColor: coordColor,
        color: textColor,
        boxShadow: `0 2px 6px -1px rgba(0, 0, 0, 0.45), 0 1px 2px rgba(0, 0, 0, 0.25), inset 0 1px 0 ${
          isDarkText ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.28)'
        }`,
        border: `1px solid ${isDarkText ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.25)'}`,
        textShadow: isDarkText ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.5)',
      }}
    >
      <span className="truncate max-w-full">{coordName}</span>
    </span>
  );
}
