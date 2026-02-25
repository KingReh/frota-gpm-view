

# Plano: Adicionar informação de Combustível (fuel_type)

## Resumo

Buscar o campo `fuel_type` da tabela `vehicles` no Supabase e exibi-lo em tres locais: card, carrossel e modal de detalhes. Substituir a duplicata de "Concessionaria" no card pelo combustivel. Tratar ausencia do dado graciosamente.

---

## Alteracoes

### 1. Tipo `VehicleWithDetails` (`src/types/vehicle.ts`)

Adicionar campo `fuel_type: string | null` a interface `VehicleWithDetails`.

### 2. Hook `useVehicles` (`src/hooks/useVehicles.ts`)

- Adicionar `fuel_type` ao `select` da query da tabela `vehicles`
- Incluir `fuel_type` no `VehicleWithCoordination` interface
- Mapear `fuel_type` no objeto combinado retornado (prioridade: `vehicles.fuel_type`)

### 3. Card (`src/components/frota/VehicleCard.tsx`)

**Visualizacao normal (nao compact):**
- Substituir o bloco "Concessionaria" (linhas 128-137, ao lado da placa) por "Combustivel", usando icone `Fuel` e exibindo `vehicle.fuel_type || 'N/I'`

**Visualizacao compact:**
- Substituir "Concessionaria" (linhas 195-198) por "Combustivel" com `vehicle.fuel_type || 'N/I'`

### 4. Carrossel (`src/components/frota/VehicleCarousel.tsx`)

Nenhuma alteracao direta necessaria -- o carrossel renderiza `VehicleCard` com `size="large"` e `hideTelemetry={true}`. A mudanca no card ja propagara a informacao de combustivel. O campo aparecera nos badges tecnicos ao lado da placa.

### 5. Modal de Detalhes (`src/components/frota/VehicleDetailModal.tsx`)

- Adicionar um `DetailRow` com icone `Fuel`, label "Combustivel" e valor `vehicle.fuel_type` na secao "Especificacoes", antes ou apos "Tipo de Frota"
- Como `DetailRow` ja retorna `null` se `value` for `null`, a ausencia do dado e tratada automaticamente

### 6. Tabela (`src/components/frota/VehicleTable.tsx`)

Nenhuma alteracao solicitada para a tabela, porem o dado estara disponivel no tipo caso futuramente necessario.

---

## Detalhes Tecnicos

- A coluna `fuel_type` ja existe na tabela `vehicles` no Supabase -- nenhuma migracao necessaria
- O dado vem de outro sistema gestor, portanto pode ser `null` -- todos os locais de exibicao tratam `null` com fallback ou ocultacao
- O backend Supabase permanece inalterado; apenas a query `select` sera expandida para incluir `fuel_type`

