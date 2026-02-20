
# Drag-and-Drop para Reordenar Blocos no Modal de Transferencia

## Resumo

Adicionar a capacidade de reordenar os dois blocos de acao ("Transferencias" e "Solicitacoes de Saldo") via drag-and-drop no Step 1 do modal. A ordem escolhida reflete diretamente na previa da mensagem (Step 2). Ao fechar o modal, a ordem volta ao padrao.

## Abordagem Tecnica

Sem adicionar dependencias externas. Os blocos sao apenas dois, entao um drag-and-drop simples com a HTML Drag API nativa e suficiente. Para mobile (touch), usaremos botoes de seta (cima/baixo) como alternativa, ja que a HTML Drag API tem suporte limitado em touch.

## Alteracoes no arquivo `src/components/frota/TransferRequestModal.tsx`

### 1. Novo estado de ordem

```typescript
// 'transfer-first' e o padrao; 'balance-first' inverte
const [blockOrder, setBlockOrder] = useState<'transfer-first' | 'balance-first'>('transfer-first');
```

Resetar no `resetForm` para `'transfer-first'`.

### 2. Renderizacao condicional dos blocos

Extrair os dois blocos (Transferencias e Solicitacoes de Saldo) em variaveis JSX (`transferBlock` e `balanceBlock`). Renderizar na ordem definida por `blockOrder`:

```typescript
const blocks = blockOrder === 'transfer-first'
  ? [transferBlock, balanceBlock]
  : [balanceBlock, transferBlock];
```

Renderizar `blocks[0]` e `blocks[1]` no lugar dos blocos fixos atuais.

### 3. Indicador visual de drag e controles

Cada bloco recebera:
- Um icone de arrastar (`GripVertical` do lucide-react) no cabecalho, ao lado do titulo
- Atributo `draggable` no cabecalho do bloco
- Handlers `onDragStart`, `onDragOver`, `onDrop` para trocar a ordem
- Em mobile: um botao de seta (cima/baixo) no lugar do drag, para trocar a posicao com um toque

O drag-and-drop so sera ativado quando ambos os blocos estiverem visiveis (`wantTransfer && wantBalance`). Se apenas um bloco estiver ativo, nao exibe o controle de arrastar.

### 4. Previa da mensagem respeita a ordem

Atualizar o `formattedMessage` (useMemo) para montar os paragrafos na ordem de `blockOrder`:

```typescript
const sections = blockOrder === 'transfer-first'
  ? [buildTransferLines, buildBalanceLines]
  : [buildBalanceLines, buildTransferLines];
sections.forEach(fn => fn(lines));
```

### 5. Feedback visual durante o drag

- Opacity reduzida no bloco sendo arrastado (`opacity-50`)
- Borda tracejada de destaque no bloco alvo (`border-dashed border-primary`)

## Comportamento

- Ordem padrao: Transferencias primeiro, Solicitacoes de Saldo depois
- O usuario so pode reordenar quando ambos os checkboxes estao marcados
- Ao fechar o modal, a ordem volta ao padrao
- A previa da mensagem no Step 2 reflete a ordem atual em tempo real
- Em mobile: botao de seta substitui o drag nativo para melhor usabilidade touch
