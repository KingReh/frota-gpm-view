## Contexto

O sistema é de uso interno confiável, com acesso público read-only intencional e sem autenticação. Correções focadas em RLS, hardening de auth ou redução de exposição pública não se aplicam.

## Ações

1. **Marcar findings do scanner Supabase como ignorados** com justificativa:
   - `SUPA_auth_otp_long_expiry` — Sistema não usa fluxo de OTP/autenticação para usuários finais; configuração irrelevante.
   - `SUPA_function_search_path_mutable` (`notify_fuel_balance_update`) — Função interna de trigger; sistema confiável de uso interno, sem superfície de ataque por schema hijacking.
   - `SUPA_vulnerable_postgres_version` — Upgrade gerenciado pela plataforma Supabase; fora do escopo do código da aplicação.

2. **Atualizar `@security-memory`** descrevendo:
   - App é PWA público read-only para consulta de saldos de frota — acesso anônimo é intencional.
   - Nunca exigir autenticação para leitura dos dados de saldo.
   - Riscos aceitos: leitura pública das tabelas de saldo, função trigger sem `search_path` fixo, versão do Postgres conforme política da plataforma, ausência de configurações de OTP.

## Sem alterações de código ou banco

Nenhum arquivo de código será modificado; nenhuma migration será criada. Apenas operações nos metadados do scanner e na memória de segurança.