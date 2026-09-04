'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface GaugeProps {
    value: number;
    max?: number;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    maskedDisplay?: string;
    className?: string;
}

export function Gauge({ value, max = 1000, label, size = 'md', maskedDisplay, className }: GaugeProps) {
    const rawId = useId();
    const id = rawId.replace(/[^a-zA-Z0-9-_]/g, '-');

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
                    className="rotate-0 overflow-visible"
                >
                    <defs>
                        {/* Recessed Track Base Groove Gradient */}
                        <linearGradient id={`${id}-track-groove`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#080c14" stopOpacity="0.9" />
                            <stop offset="45%" stopColor="#1e293b" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#06090e" stopOpacity="0.95" />
                        </linearGradient>

                        {/* Milled Outer Bezel Rim Reflection */}
                        <linearGradient id={`${id}-track-rim`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                            <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
                        </linearGradient>

                        {/* Vibrant 3D Progress Fill Gradient */}
                        <linearGradient id={`${id}-gauge-gradient`} x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#E63946" />
                            <stop offset="38%" stopColor="#F59E0B" />
                            <stop offset="72%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#00FF9D" />
                        </linearGradient>

                        {/* Soft blur for cast shadow inside the track */}
                        <filter id={`${id}-cast-shadow`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="1.2" />
                        </filter>

                        {/* 3D Cylindrical Volume Filter */}
                        <filter id={`${id}-tube-volume`} x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#000000" floodOpacity="0.55" />
                        </filter>
                    </defs>

                    {/* === 1. UNFILLED TRACK (SUNKEN 3D GROOVE / PROFUNDIDADE) === */}
                    {/* 1.1 Outer Bezel Groove Socket (borda de corte escurecida) */}
                    <path
                        d="M 20 80 A 40 40 0 1 1 80 80"
                        fill="none"
                        stroke="rgba(0, 0, 0, 0.55)"
                        strokeWidth={sizeMetrics.stroke + 2.5}
                        strokeLinecap="round"
                    />

                    {/* 1.2 Recessed Groove Bed (leito da canaleta afundada) */}
                    <path
                        d="M 20 80 A 40 40 0 1 1 80 80"
                        fill="none"
                        stroke={`url(#${id}-track-groove)`}
                        strokeWidth={sizeMetrics.stroke + 0.5}
                        strokeLinecap="round"
                    />

                    {/* 1.3 Deep Cavity Inset Occlusion (sombra interna profunda de cavidade) */}
                    <path
                        d="M 20 80 A 40 40 0 1 1 80 80"
                        fill="none"
                        stroke="rgba(0, 0, 0, 0.65)"
                        strokeWidth={Math.max(2, sizeMetrics.stroke - 2.5)}
                        strokeLinecap="round"
                    />

                    {/* 1.4 Bottom Bezel Lip Light (reflexo de borda chanfrada da canaleta) */}
                    <path
                        d="M 20 80 A 40 40 0 1 1 80 80"
                        fill="none"
                        stroke={`url(#${id}-track-rim)`}
                        strokeWidth={1}
                        strokeLinecap="round"
                        transform="translate(0, 0.8)"
                        className="opacity-40 dark:opacity-25"
                    />

                    {/* === 2. 3D PROGRESS FILL (BARRA COM VOLUME E PROFUNDIDADE) === */}
                    {/* 2.1 Cast Shadow inside the recessed track */}
                    {percentage > 0 && (
                        <path
                            d="M 20 80 A 40 40 0 1 1 80 80"
                            fill="none"
                            stroke="rgba(0, 0, 0, 0.7)"
                            strokeWidth={sizeMetrics.stroke}
                            strokeLinecap="round"
                            strokeDasharray="200"
                            strokeDashoffset={200 - (percentage / 100) * 188}
                            filter={`url(#${id}-cast-shadow)`}
                            transform="translate(0, 1.6)"
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                    )}

                    {/* 2.2 Volumetric 3D Progress Tube */}
                    <path
                        d="M 20 80 A 40 40 0 1 1 80 80"
                        fill="none"
                        stroke={`url(#${id}-gauge-gradient)`}
                        strokeWidth={sizeMetrics.stroke}
                        strokeLinecap="round"
                        strokeDasharray="200"
                        strokeDashoffset={200 - (percentage / 100) * 188}
                        filter={`url(#${id}-tube-volume)`}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>

                {/* Center Content: Dominant Value + Subtle Percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
                    <span
                        className={cn(
                            "font-mono font-black text-foreground tracking-tighter",
                            "drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] [text-shadow:0_1px_1px_rgba(0,0,0,0.35),0_2px_3px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.65),0_14px_24px_rgba(0,0,0,0.45)]",
                            sizeMetrics.currencyFont
                        )}
                    >
                        {maskedDisplay ?? formatCurrency(value).replace('R$', '').trim()}
                    </span>
                    {!maskedDisplay && (
                      <span className={cn("font-mono font-bold text-muted-foreground/60 select-none", sizeMetrics.percentFont)}>
                          {percentage.toFixed(0)}%
                      </span>
                    )}
                </div>
            </div>

            {/* Label repositioned below the gauge - tighter spacing */}
            {label && (
                <span className={cn("uppercase tracking-[0.4em] text-muted-foreground font-black font-mono mt-0 text-center", sizeMetrics.labelFont)}>
                    {label}
                </span>
            )}
        </div>
    );
}

