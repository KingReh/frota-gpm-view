

## Problema

O campo `next_period_limit` no banco de dados contém `"0,00"` para a maioria dos veículos. O `parseBalance("0,00")` retorna `0`, e o Gauge recebe `max=0`, o que faz `percentage = 0` independentemente do saldo real -- resultando em um arco vazio mesmo quando o veículo tem saldo.

## Solução

Alterar o `VehicleCard.tsx` para usar `current_limit` como fallback quando `next_period_limit` resulta em zero.

### Alteracao em `src/components/frota/VehicleCard.tsx`

Onde o Gauge e chamado (linhas ~185-197), substituir:

```tsx
max={parseBalance(vehicle.next_period_limit)}
```

por:

```tsx
max={parseBalance(vehicle.next_period_limit) || parseBalance(vehicle.current_limit) || 1000}
```

Isso se aplica as duas chamadas do Gauge (masked e nao-masked). A logica de fallback:
1. Usa `next_period_limit` se > 0
2. Senao usa `current_limit` se > 0
3. Senao usa 1000 como default seguro

Nenhuma alteracao de banco de dados e necessaria.

