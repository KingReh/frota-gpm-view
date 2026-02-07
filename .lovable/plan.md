

# Aba "Veiculos Indefinidos"

## Resumo

Adicionar um sistema de abas na pagina principal separando os veiculos em duas categorias:
- **Frota** -- veiculos com coordenacao definida (comportamento atual)
- **Indefinidos** -- veiculos sem coordenacao (novos ou reservas)

Atualmente existem 6 veiculos no banco sem coordenacao atribuida. Eles ficam invisiveis quando filtros de coordenacao sao aplicados. Com essa mudanca, passam a ter visibilidade dedicada.

---

## Como vai funcionar

A pagina principal ganha duas abas no topo, logo abaixo do header:

```text
+-------------------------------+
|  [ Frota ]  [ Indefinidos(6) ]|
+-------------------------------+
```

- **Aba Frota**: Exibe o conteudo atual (filtros de coordenacao, estatisticas de saldo, toggle de visualizacao, grid/tabela/carrossel)
- **Aba Indefinidos**: Exibe apenas veiculos sem coordenacao, com suas proprias estatisticas de saldo e o mesmo toggle de visualizacao (grid/tabela/carrossel). Sem filtro de coordenacao (nao faz sentido).

O contador ao lado de "Indefinidos" mostra quantos veiculos estao nessa situacao, dando visibilidade imediata ao gestor.

---

## Detalhes Tecnicos

### 1. Alterar o hook `useVehicles` para separar veiculos indefinidos

O hook atualmente filtra veiculos por coordenacao selecionada. Sera modificado para retornar tambem a lista de veiculos indefinidos (sem coordenacao) como um campo separado:

- `data` -- veiculos com coordenacao (filtrados, como hoje)
- `undefinedVehicles` -- veiculos sem coordenacao (sem filtro)

A logica de separacao sera feita no `queryFn`, onde veiculos com `coordination === null` sao colocados em uma lista separada em vez de serem descartados pelo filtro.

### 2. Adicionar tipo de aba nas preferencias do usuario

No arquivo `src/types/vehicle.ts`, adicionar um novo tipo para controlar a aba ativa:

```
type FleetTab = 'fleet' | 'undefined';
```

Adicionar ao `UserPreferences` para persistir a aba selecionada via localStorage.

### 3. Modificar a pagina `Index.tsx`

Usar o componente `Tabs` do Radix UI (ja disponivel em `src/components/ui/tabs.tsx`) para criar as duas abas:

- Aba "Frota": renderiza os componentes atuais (CoordinationFilters, BalanceStats, ViewModeToggle, conteudo)
- Aba "Indefinidos": renderiza BalanceStats e ViewModeToggle com os veiculos indefinidos, sem CoordinationFilters

A contagem de indefinidos sera exibida como badge no trigger da aba.

### 4. Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/types/vehicle.ts` | Adicionar tipo `FleetTab`, atualizar `UserPreferences` |
| `src/hooks/useVehicles.ts` | Retornar `undefinedVehicles` separadamente |
| `src/hooks/useUserPreferences.ts` | Adicionar `setActiveTab` |
| `src/pages/Index.tsx` | Implementar sistema de abas com `Tabs`/`TabsContent` |

Nenhum componente novo precisa ser criado. Os componentes existentes (`VehicleGrid`, `VehicleTable`, `VehicleCarousel`, `BalanceStats`, `VehicleDetailModal`) ja recebem `vehicles[]` como prop e funcionarao normalmente com a lista de indefinidos.

