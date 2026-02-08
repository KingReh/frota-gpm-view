'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GaugeProps {
    value: number;
    max?: number;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Gauge({ value, max = 1000, label, size = 'md', className }: GaugeProps) {
    // Normalize value based on the provided max limit
    const percentage = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;

    // Angular constants for the arc
    const startAngle = -210;
    const endAngle = 30;
    const range = endAngle - startAngle;
    const currentAngle = startAngle + (percentage / 100) * range;

    const sizeMetrics = {
        sm: { width: 64, height: 64, stroke: 6, currencyFont: 'text-xs', percentFont: 'text-[6px]', labelFont: 'text-[7px]' },
        md: { width: 112, height: 112, stroke: 8, currencyFont: 'text-xl', percentFont: 'text-[10px]', labelFont: 'text-[9px]' },
        lg: { width: 176, height: 170, stroke: 12, currencyFont: 'text-4xl', percentFont: 'text-sm', labelFont: 'text-[11px]' },
    }[size];

    const formatCurrency = (val: number) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className={cn("relative flex flex-col items-center justify-center", className)}>
            <div className="relative flex items-center justify-center">
                <svg
                    width={sizeMetrics.width}
                    height={sizeMetrics.height}
                    viewBox="0 0 100 100"
                    className="rotate-0"
                >
                    {/* Background Arc */}
                    <path
                        d="M 20 80 A 40 40 0 1 1 80 80"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={sizeMetrics.stroke}
                        strokeLinecap="round"
                        className="text-white/5"
                    />

                    {/* Progress Arc */}
                    <motion.path
                        d="M 20 80 A 40 40 0 1 1 80 80"
                        fill="none"
                        stroke="url(#gauge-gradient)"
                        strokeWidth={sizeMetrics.stroke}
                        strokeLinecap="round"
                        strokeDasharray="200"
                        initial={{ strokeDashoffset: 200 }}
                        animate={{ strokeDashoffset: 200 - (percentage / 100) * 188 }}
                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    />

                    <defs>
                        <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#E63946" />
                            <stop offset="50%" stopColor="#FCD34D" />
                            <stop offset="100%" stopColor="#00FF9D" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center Content: Dominant Value + Subtle Percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
                    <span className={cn("font-mono font-black text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.8)] tracking-tighter", sizeMetrics.currencyFont)}>
                        {formatCurrency(value).replace('R$', '').trim()}
                    </span>
                    <span className={cn("font-mono font-bold text-white/20 select-none", sizeMetrics.percentFont)}>
                        {percentage.toFixed(0)}%
                    </span>
                </div>
            </div>

            {/* Label repositioned below the gauge - tighter spacing */}
            {label && (
                <span className={cn("uppercase tracking-[0.4em] text-zinc-500 font-black font-mono mt-0 text-center", sizeMetrics.labelFont)}>
                    {label}
                </span>
            )}
        </div>
    );
}

