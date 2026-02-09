
# Notificacao Push -- Plano de Implementacao Seguro

## Principio fundamental

**Nenhuma tabela existente sera alterada.** As tabelas `push_subscriptions`, `push_notifications_log` e `vehicle_data` permanecem intactas. Apenas recursos novos serao criados (trigger, edge function, componente frontend).

---

## O que ja existe no projeto

| Recurso | Status |
|---|---|
| Tabela `push_subscriptions` | Existe, pronta para uso |
| Tabela `push_notifications_log` | Existe, pronta para uso |
| Funcao DB `notify_fuel_balance_update()` | Existe, chama a edge function via `pg_net` |
| Secrets `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` | Configurados |
| Trigger na tabela `vehicle_data` | **NAO existe** (precisa ser criado) |
| Edge Function `send-push-notification` | **NAO existe** (precisa ser criada) |
| Service Worker push handler | **NAO existe** (precisa ser adicionado) |
| Componente frontend de subscricao | **NAO existe** (precisa ser criado) |

---

## O que sera feito

### 1. Criar trigger na tabela `vehicle_data` (migracao SQL)

Um trigger `AFTER INSERT OR UPDATE ... FOR EACH STATEMENT` sera adicionado a tabela `vehicle_data`. Isso:
- Nao altera a estrutura da tabela (nenhuma coluna adicionada/removida)
- Nao afeta operacoes de leitura ou escrita existentes
- Apenas dispara a funcao `notify_fuel_balance_update()` que ja existe
- Usa `FOR EACH STATEMENT` para enviar apenas uma notificacao por upload em lote

```sql
CREATE TRIGGER on_vehicle_data_update
  AFTER INSERT OR UPDATE ON vehicle_data
  FOR EACH STATEMENT
  EXECUTE FUNCTION notify_fuel_balance_update();
```

### 2. Criar Edge Function `send-push-notification`

Novo arquivo: `supabase/functions/send-push-notification/index.ts`

Responsabilidades:
- Receber o evento disparado pela funcao DB
- Buscar todas as subscricoes na tabela `push_subscriptions`
- Enviar push notification para cada subscricao usando a lib `web-push`
- Remover subscricoes invalidas (endpoint expirado / 410 Gone)
- Atualizar `last_used_at` nas subscricoes validas
- Registrar resultado em `push_notifications_log`

Mensagem fixa:
- Titulo: "Aviso"
- Corpo: "Saldo de combustivel atualizado pela GPM!"

### 3. Adicionar handlers de push ao Service Worker (`public/sw.js`)

Dois novos event listeners:
- `push`: exibe a notificacao nativa com titulo, corpo e icone do app
- `notificationclick`: abre/foca a aba do app ao clicar na notificacao

### 4. Criar componente `PushNotificationManager`

Novo arquivo: `src/components/pwa/PushNotificationManager.tsx`

Responsabilidades:
- Verificar se o navegador suporta push notifications
- Solicitar permissao do usuario (via banner amigavel, mesmo estilo do `InstallPrompt`)
- Gerar a subscricao push com a VAPID public key
- Salvar a subscricao na tabela `push_subscriptions` (upsert por endpoint)
- Persistir no `localStorage` que o usuario ja configurou push
- Funcionar sem autenticacao (subscricao anonima por dispositivo)

### 5. Integrar no `App.tsx`

Adicionar `<PushNotificationManager />` ao lado dos demais componentes PWA.

---

## Impacto no banco de dados

| Operacao | Tabela | Tipo de alteracao |
|---|---|---|
| Criar trigger | `vehicle_data` | Adicionar trigger (nao altera schema) |
| Nenhuma | `push_subscriptions` | Nenhuma -- ja existe |
| Nenhuma | `push_notifications_log` | Nenhuma -- ja existe |

**Nenhuma coluna, tabela ou politica RLS sera criada, alterada ou removida.**

---

## Fluxo completo

```text
Gestor faz upload no sistema gestor
            |
            v
vehicle_data recebe INSERT/UPDATE
            |
            v
Trigger dispara notify_fuel_balance_update()
            |
            v
pg_net chama Edge Function send-push-notification
            |
            v
Edge Function busca push_subscriptions
            |
            v
Envia push para todos os dispositivos
            |
            v
Service Worker exibe notificacao nativa
            |
            v
Condutor ve "Saldo de combustivel atualizado pela GPM!"
```

---

## Arquivos criados/modificados

| Arquivo | Acao |
|---|---|
| `supabase/functions/send-push-notification/index.ts` | **Criar** |
| `supabase/config.toml` | **Modificar** (adicionar config da edge function) |
| `public/sw.js` | **Modificar** (adicionar handlers push e notificationclick) |
| `src/components/pwa/PushNotificationManager.tsx` | **Criar** |
| `src/App.tsx` | **Modificar** (adicionar PushNotificationManager) |
| Migracao SQL | **Criar trigger** (nao altera tabelas) |
