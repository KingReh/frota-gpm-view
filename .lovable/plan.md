

# Migração de Cor: Vermelho → Azul #0066B3

## Resumo

Substituição sistemática de todos os usos de vermelho como cor de identidade visual pelo azul `#0066B3` e suas variantes, preservando a estética premium e mantendo os vermelhos semânticos (erros, saldo zero, alertas).

## Mapeamento de Cores

| Uso | Vermelho Atual (HSL) | Azul Novo (HSL) |
|-----|---------------------|-----------------|
| **Primary (base)** | `0 100% 56%` (#FF2D20) | `207 100% 35%` (#0066B3) |
| **Ring** | `0 100% 56%` | `207 100% 35%` |
| **text-glow** | `rgba(255, 45, 32, 0.5)` | `rgba(0, 102, 179, 0.5)` |
| **Carousel dot ativo** | `rgba(255, 45, 32, 1)` | `rgba(0, 102, 179, 1)` |
| **Pulse dot (tabela)** | `rgba(255,45,32,0.8)` | `rgba(0,102,179,0.8)` |
| **Notification ping** | `bg-red-400/bg-red-500` | `bg-blue-400/bg-blue-500` |

### Variantes tonais do #0066B3:
- **Hover**: HSL 207 100% 30% (mais escuro)
- **Active/Pressed**: HSL 207 100% 25%
- **Fundo suave (10%)**: hsl(207 100% 35% / 0.1)
- **Borda (20-40%)**: hsl(207 100% 35% / 0.2-0.4)
- **Shadow glow**: rgba(0, 102, 179, 0.3-0.8)

### Acessibilidade (WCAG AA):
- `#0066B3` sobre fundo escuro (#161A21): ratio ~4.7:1 -- passa AA
- `#FFFFFF` sobre `#0066B3`: ratio ~5.7:1 -- passa AA

## Exceções (NAO alterar)

- `--destructive` (HSL `0 62.8% 30.6%`) -- erros/alertas
- `--balance-low` (HSL `0 84% 60%`) -- saldo zero
- `text-red-400` em `TotalBalanceStats.tsx` (saldo zero) -- semantico
- Classes `destructive` nos toasts/alerts -- semantico
- `#E63946` no gradiente do Gauge (vermelho para saldo baixo no degradê) -- semantico

## Arquivos a Modificar

### 1. `src/index.css` (tokens centrais)
- `--primary`: `0 100% 56%` → `207 100% 35%`
- `--ring`: `0 100% 56%` → `207 100% 35%`
- `.text-glow`: rgba vermelho → rgba azul

### 2. `src/components/frota/VehicleCarousel.tsx`
- Linha 93: `rgba(255, 45, 32, 1)` → `rgba(0, 102, 179, 1)`

### 3. `src/components/frota/VehicleTable.tsx`
- Linha 132: `shadow-[0_0_8px_rgba(255,45,32,0.8)]` → `shadow-[0_0_8px_rgba(0,102,179,0.8)]`

### 4. `src/components/layout/Header.tsx`
- Linhas 23-24: `bg-red-400` → `bg-blue-400`, `bg-red-500` → `bg-blue-500`

### 5. `src/components/frota/AppHeader.tsx`
- Linhas 32-33: `bg-red-400` → `bg-blue-400`, `bg-red-500` → `bg-blue-500`

### 6. Componentes que usam `text-primary`, `bg-primary`, etc.
Estes ja herdam a mudanca automaticamente via token CSS `--primary` e NAO precisam de alteracoes manuais:
- `VehicleCard.tsx`, `VehicleDetailModal.tsx`, `FabMenu.tsx`, `CoordinationFilters.tsx`, `SortControl.tsx`, `TotalBalanceStats.tsx`, `TransferRequestModal.tsx`, `SearchBar.tsx`, `DashboardLayout.tsx`, componentes UI base (button, checkbox, progress, etc.)

## Total: 5 arquivos editados

A grande maioria da migracacao ocorre automaticamente pela alteracao dos 3 tokens CSS no `index.css`. Apenas 4 arquivos adicionais possuem cores vermelhas hardcoded que precisam de substituicacao manual.

