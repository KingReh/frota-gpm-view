

# Plano: Campo "Problemas Identificados" na Manutenção

## 1. Banco de Dados
Adicionar coluna `identified_problems` (text, NOT NULL, default '') à tabela `vehicle_maintenance` via migração.

## 2. Hook `useVehicleMaintenance.ts`
- Adicionar `identified_problems: string` à interface `VehicleMaintenance`
- Adicionar `identified_problems: string` à interface `InsertPayload`

## 3. Modal `MaintenanceModal.tsx`

**Aba Solicitação:**
- Novo estado `identifiedProblems`
- Campo Textarea obrigatório com label "Problemas Identificados"
- Botão "Adicionar" desabilitado se campo vazio
- Reset do campo no `resetForm()`
- Enviar valor no `handleAdd()`

**Aba Painel Geral:**
- Exibir `InfoTooltip` (componente já existente) ao lado da placa, mostrando o texto dos problemas identificados

## 4. Tipos Supabase
Atualizar `types.ts` automaticamente após migração.

