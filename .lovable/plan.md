

# Solicitar Transferencia - Plano de Implementacao (v3)

## Resumo

Adicionar ao FAB Menu uma nova opcao "Solicitar Transferencia" que abre um modal multi-etapas (wizard) permitindo ao usuario montar uma solicitacao de transferencia de saldo entre veiculos e/ou requisicao de novos recursos, gerando uma mensagem formatada enviada automaticamente via WhatsApp ou e-mail ao gestor da frota.

## Regra de Prioridade de Canal

```text
1. Se status_telefone = true  --> WhatsApp (mesmo que status_email tambem seja true)
2. Se status_telefone = false E status_email = true  --> E-mail
3. Se ambos false  --> Alerta de canal indisponivel
```

## Arquitetura

```text
FAB Menu
  |
  v
[Etapa 1] Selecao de tipo + veiculos/valores
  |
  v
[Etapa 2] Nome do usuario + preview da mensagem + acoes (Copiar / Enviar)
```

## Arquivos a Criar

### 1. `src/lib/whatsapp.ts`
Utilitarios isolados:
- `formatPhoneForWhatsApp(telefone: string): string` - converte "(81) 98594-2139" para "5581985942139"
- `detectPlatform(): 'desktop' | 'mobile'`
- `getGreeting(): string` - saudacao baseada na hora do dia
- `openWhatsApp(phone: string, message: string): void` - desktop usa `https://web.whatsapp.com/send`, mobile usa `https://api.whatsapp.com/send`
- `openEmail(email: string, subject: string, body: string): void` - abre mailto

### 2. `src/hooks/useGestorFrota.ts`
Hook com `useQuery`:
- Query: `supabase.from('gestor_frota').select('name, telefone, email, status_telefone, status_email').limit(1).maybeSingle()`
- staleTime: 5 minutos

### 3. `src/components/frota/TransferRequestModal.tsx`
Modal com 2 etapas:

**Etapa 1 - Formulario:**
- Checkboxes para tipo (transferencia / novo recurso)
- Lista dinamica de transferencias: selects origem/destino + valor monetario + adicionar/remover
- Lista dinamica de solicitacoes de saldo: select veiculo + valor + adicionar/remover
- Veiculos filtrados conforme coordenacoes do filtro central
- Validacoes: pelo menos uma opcao, pelo menos um item, origem != destino, valor > 0

**Etapa 2 - Confirmacao:**
- Input "Digite seu nome"
- Preview da mensagem formatada (somente leitura com scroll)
- Coordenacao: nome da primeira coordenacao selecionada, fallback "GPM"
- Botao "Copiar" - clipboard + toast
- Botao "Enviar" com logica de prioridade WhatsApp > Email

### 4. Modificar `src/components/frota/FabMenu.tsx`
- Novo item "Solicitar Transferencia" com icone `ArrowLeftRight`

### 5. Modificar `src/components/layout/DashboardLayout.tsx`
- Repassar vehicles, coordinations, selectedCoordinations para FabMenu

### 6. Modificar `src/pages/Index.tsx`
- Passar dados para DashboardLayout

## Formato da Mensagem (Atualizado)

As placas sao exibidas sem hifen (como armazenadas no banco) e os valores sem o prefixo "R$":

```text
Bom dia, Renato!

Me chamo {nome} da coordenacao {coord} e gostaria de solicitar uma transferencia de combustivel para minha frota da seguinte forma:

Transferencia entre veiculos:
(ABC1234 = 150,00) para DEF5678

Solicitacao de Saldo:
GHI9012 = 200,00
```

- Placas: exibidas exatamente como vem do banco (sem hifen, ex: `ABC1234`)
- Valores: formato brasileiro com virgula decimal e ponto de milhar, sem prefixo "R$" (ex: `1.500,00`)
- Funcao de formatacao: `new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)` (sem `style: 'currency'`)

## Logica de Envio

```text
if (!gestor) -> alerta "gestor indisponivel"
else if (gestor.status_telefone) -> WhatsApp  // PRIORIDADE
else if (gestor.status_email) -> Email
else -> alerta "nenhum canal disponivel"
```

## Seguranca
- Zero escritas no banco (apenas SELECT em gestor_frota)
- URLs construidas com `encodeURIComponent`
- Input sanitizado (trim, max length)

## Resumo de Alteracoes

| Arquivo | Acao |
|---|---|
| `src/lib/whatsapp.ts` | Criar |
| `src/hooks/useGestorFrota.ts` | Criar |
| `src/components/frota/TransferRequestModal.tsx` | Criar |
| `src/components/frota/FabMenu.tsx` | Modificar |
| `src/components/layout/DashboardLayout.tsx` | Modificar |
| `src/pages/Index.tsx` | Modificar |

