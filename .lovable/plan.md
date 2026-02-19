

# Refatoracao da Logica de Deltas no Modal de Transferencia

## Analise do Problema

Atualmente existem dois mapas de deltas separados:

- **`transferDeltas`** -- calcula subtracao/adicao por placa a partir das transferencias
- **`balanceDeltas`** -- calcula adicao por placa a partir das solicitacoes de saldo

O problema de coerencia esta em como cada bloco usa esses mapas:

| Bloco | Delta usado no feedback | Correto? |
|---|---|---|
| Transferencias (Origem/Destino) | Apenas `transferDeltas` | Incompleto -- ignora saldo adicional do bloco "Solicitacao de Saldo" |
| Solicitacoes de Saldo | `transferDeltas + balanceDeltas` | Correto |

**Exemplo do bug:** Se o usuario transfere R$300 do veiculo A (saldo R$500) e tambem solicita R$200 de saldo novo para o veiculo A, o feedback no bloco de transferencia mostra R$200 (500-300), mas o saldo real projetado seria R$400 (500-300+200). O bloco de saldo mostra R$400 corretamente, mas o de transferencia nao.

A validacao de saldo insuficiente no `updateTransfer` tambem ignora solicitacoes de saldo que poderiam aumentar o saldo do veiculo de origem.

## Solucao

1. **Criar um mapa unificado `combinedDeltas`** que soma `transferDeltas` e `balanceDeltas` para cada placa
2. **Usar `combinedDeltas` em todos os `BalanceFeedback`** de ambos os blocos, garantindo que o feedback sempre reflita o estado real projetado
3. **Atualizar a validacao no `updateTransfer`** para considerar tambem valores de solicitacao de saldo que incrementam o saldo do veiculo de origem

## Detalhes Tecnicos

### Arquivo: `src/components/frota/TransferRequestModal.tsx`

**Novo useMemo -- `combinedDeltas`:**
```typescript
const combinedDeltas = useMemo(() => {
  const deltas: Record<string, number> = { ...transferDeltas };
  Object.entries(balanceDeltas).forEach(([plate, val]) => {
    deltas[plate] = (deltas[plate] || 0) + val;
  });
  return deltas;
}, [transferDeltas, balanceDeltas]);
```

**Feedback no bloco Transferencias (linhas 399, 434):**
- Trocar `transferDeltas[plate]` por `combinedDeltas[plate]`

**Feedback no bloco Solicitacoes de Saldo (linha 485):**
- Simplificar de `(transferDeltas[b.plate] || 0) + (balanceDeltas[b.plate] || 0)` para `combinedDeltas[b.plate] || 0`

**Validacao no `updateTransfer` (linhas 299-305):**
- Incluir no calculo de `otherDeltas` os valores de `balanceDeltas` para o veiculo de origem, permitindo que saldo solicitado no outro bloco "libere" margem para a transferencia

