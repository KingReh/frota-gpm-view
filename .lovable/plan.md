

# Plano: Modulo de Controle de Manutencao de Frota (Revisado)

## Resumo

Criar um modulo completo de manutencao de veiculos acessivel via FAB Menu, com modal de duas abas (solicitacao e painel geral), persistido em nova tabela Supabase. O link externo "GAD Manutencao" permanece inalterado.

## 1. Banco de Dados

Criar tabela `vehicle_maintenance` via migracao:

```sql
CREATE TABLE public.vehicle_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate text NOT NULL,
  fleet_type text,
  model text,
  os_number integer,
  requested_date date NOT NULL,
  gad_service_date date,
  workshop_entry_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access for vehicle_maintenance"
  ON public.vehicle_maintenance FOR ALL
  TO public
  USING (true) WITH CHECK (true);
```

## 2. Novos Arquivos

### `src/hooks/useVehicleMaintenance.ts`
- Hook com react-query para CRUD na tabela `vehicle_maintenance`
- Funcoes: listar todos, inserir registro, atualizar datas, deletar (retorno oficina)

### `src/components/frota/MaintenanceModal.tsx`
- Modal com Dialog, duas abas usando Tabs

**Aba 1 - Solicitacao:**
- Select de veiculo filtrado pelas coordenacoes selecionadas
- Campo OS numerico, visivel apenas quando `fleet_type === 'PROPRIO'`
- DatePicker para "Data Solicitada a GAD"
- Botao "Adicionar"

**Aba 2 - Painel Geral:**
- Lista de registros ativos com placa, modelo, tipo, campos de data editaveis, tempo calculado, checkbox de retorno
- Tempo na oficina calculado no frontend
- Checkbox "Retorno da Oficina" deleta o registro

## 3. Alteracao no FabMenu

### `src/components/frota/FabMenu.tsx`
- **Manter** o link externo "GAD Manutencao" (Power BI) exatamente como esta
- **Adicionar um novo item** "GPM Manutencao" logo apos o "GAD Manutencao", com icone `Settings`, que abre o `MaintenanceModal`
- Adicionar estado `maintenanceModalOpen` e renderizar `<MaintenanceModal />`
- Passar `vehicles`, `coordinations`, `selectedCoordinations` como props

## 4. Design e Responsividade

- Reutilizar componentes UI existentes (Dialog, Tabs, Calendar, Checkbox, etc.)
- Padrao visual premium consistente com o sistema
- Mobile: NativePlateSelect para seletor de placa, layout em cards
- Desktop: layout em tabela compacta

## 5. Fluxo de Dados

```text
FAB Menu
  ├─ GAD Manutencao (link externo Power BI — inalterado)
  └─ GPM Manutencao (novo item — abre modal)
       ├─ Aba 1: form → useVehicleMaintenance.add()
       └─ Aba 2: useVehicleMaintenance.list()
                  ├─ update dates → useVehicleMaintenance.update()
                  └─ checkbox retorno → useVehicleMaintenance.delete()
```

Nenhuma tabela, funcao ou trigger existente sera modificada.

