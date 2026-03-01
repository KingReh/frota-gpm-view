

# Dashboard - Painel Central de Inteligencia da Frota

## Resumo

Criar uma subpagina `/dashboard` com visualizacao completa da frota atraves de cards de resumo, graficos interativos (pizza, barras, linha) e tabelas de detalhe, com filtro por coordenacao reaproveitado e design premium consistente com o sistema.

## Dados Disponiveis no Banco

Com base na analise do banco, os seguintes dados serao utilizados:

- **fleet_type**: PROPRIO, LOCADO, PROPRIA (proprio vs locado)
- **manufacturer**: HONDA, MERCEDES-BENZ, VOLKSWAGEN, VW, FIAT, IVECO, CHEVROLET, FORD, etc.
- **fuel_type** (tabela vehicles): DIESEL, ALCOOL/GASOLINA, GASOLINA/ALCOOL/GNV, MULTIFUEL
- **model**: SAVEIRO, S10, MOBI, RANGER, CARGO, DELIVERY, etc.
- **coordination**: via join com tabela coordinations
- **balance**: saldo por veiculo
- **Total de veiculos**: 63

## Estrutura de Arquivos

### Novos arquivos a criar:

1. **`src/pages/Dashboard.tsx`** - Pagina principal do dashboard
2. **`src/hooks/useDashboardData.ts`** - Hook dedicado para buscar e processar todos os dados do dashboard
3. **`src/components/dashboard/StatCard.tsx`** - Card de resumo reutilizavel
4. **`src/components/dashboard/FleetTypeChart.tsx`** - Grafico de rosca (proprio vs locado)
5. **`src/components/dashboard/FuelTypeChart.tsx`** - Grafico de rosca (tipos de combustivel)
6. **`src/components/dashboard/CoordinationBarChart.tsx`** - Grafico de barras (veiculos por coordenacao + saldo)
7. **`src/components/dashboard/ModelBarChart.tsx`** - Grafico de barras (modelos mais frequentes)
8. **`src/components/dashboard/ManufacturerBarChart.tsx`** - Grafico de barras (concessionarias/fabricantes)
9. **`src/components/dashboard/CoordinationBalanceLineChart.tsx`** - Grafico de linha (saldo por coordenacao)
10. **`src/components/dashboard/DetailTable.tsx`** - Tabela de detalhe reutilizavel

### Arquivos a modificar:

1. **`src/App.tsx`** - Adicionar rota `/dashboard`
2. **`src/components/layout/Header.tsx`** - Adicionar link de navegacao para o Dashboard

## Arquitetura

### Hook `useDashboardData`

Reutiliza a mesma estrategia do `useVehicles` (queries ao Supabase com `@tanstack/react-query`), mas retorna dados agregados:

```text
{
  totalVehicles: number
  ownedCount: number       // PROPRIO + PROPRIA
  rentedCount: number      // LOCADO
  distinctModels: number
  distinctFuelTypes: number
  distinctManufacturers: number
  byCoordination: { name, color, count, totalBalance }[]
  byFleetType: { name, count }[]
  byFuelType: { name, count }[]
  byModel: { name, count }[]
  byManufacturer: { name, count }[]
}
```

Aceita `selectedCoordinations` como parametro para filtrar todos os dados quando o usuario seleciona uma coordenacao.

### Pagina Dashboard

Layout em grid responsivo:

```text
Mobile (1 col):
  [Card] [Card] [Card] [Card] [Card] [Card]
  [Grafico Rosca - Tipo Frota]
  [Grafico Rosca - Combustivel]
  [Grafico Barras - Coordenacoes]
  [Grafico Barras - Modelos]
  [Grafico Barras - Fabricantes]
  [Grafico Linha - Saldo por Coord]
  [Tabela Coordenacoes]
  [Tabela Modelos]
  [Tabela Fabricantes]

Tablet (2 cols):
  [Card][Card]  [Card][Card]  [Card][Card]
  [Rosca Tipo][Rosca Combustivel]
  [Barras Coordenacoes - full width]
  [Barras Modelos][Barras Fabricantes]
  [Linha Saldo - full width]
  [Tabelas...]

Desktop (3-4 cols):
  [Card][Card][Card][Card][Card][Card]
  [Rosca][Rosca][Barras Coordenacoes]
  [Barras Modelos][Barras Fabricantes][Linha Saldo]
  [Tabelas lado a lado]
```

### Navegacao

- Adicionar botao/link "Dashboard" no Header ao lado do logo ou como icone
- Link de volta para a pagina principal (Frota) tambem no Header do Dashboard
- Reutilizar o `DashboardLayout` existente (sem viewMode/FAB, apenas header + conteudo)

### Filtro por Coordenacao

- Reutilizar o componente `CoordinationFilters` ja existente no topo da pagina
- Usar `useCoordinations()` para carregar as coordenacoes
- Ao filtrar, todos os cards, graficos e tabelas atualizam automaticamente

## Design

### Cards de Resumo (StatCard)

- Design `glass-panel` com borda lateral colorida (como o card principal do TotalBalanceStats)
- Icone grande semi-transparente no fundo (padrao existente)
- Numero principal grande em `font-mono font-bold`
- Label em `text-xs uppercase tracking-widest`
- Animacao de entrada com `animate-in fade-in`

### Graficos

- Usar `recharts` (ja instalado) com os componentes `ChartContainer`, `ChartTooltip` do `chart.tsx`
- Cores derivadas das coordenacoes (quando aplicavel) ou do sistema de tokens
- Animacoes de entrada nativas do recharts
- Tooltips informativos com `ChartTooltipContent`
- Rosca/Pizza: legenda lateral em desktop, abaixo em mobile
- Barras: eixo X com labels truncados, tooltip com valor completo

### Tabelas de Detalhe

- Reutilizar componentes `Table` do shadcn/ui
- Scroll horizontal em mobile com `custom-scrollbar-thin`
- Zebra striping sutil com `bg-white/[0.02]`
- Headers sticky

### Cores dos Graficos

- Proprio vs Locado: primary (#0066B3) e secondary (#00D4FF)
- Combustivel: paleta de 4 tons derivados do azul primario
- Coordenacoes: usar a cor propria de cada coordenacao do banco
- Fabricantes/Modelos: escala de tons de azul/cinza

## Detalhes Tecnicos

### Rota

```text
App.tsx:
  <Route path="/dashboard" element={<DashboardPage />} />
```

### Responsividade

- Cards: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`
- Graficos: `ResponsiveContainer` do recharts com `width="100%" height={300}`
- Tabelas: `overflow-x-auto` com `custom-scrollbar-thin`
- Touch targets: minimo 44px em botoes e filtros (ja garantido pelo design existente)

### Performance

- `useMemo` para todas as agregacoes de dados
- Query separada do dashboard para nao interferir com a query da pagina principal
- `staleTime: 30s` consistente com o resto do sistema

## Total: ~12 arquivos (10 novos + 2 modificados)

