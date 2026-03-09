# Frota GPM — COMPESA

Sistema PWA mobile-first de consulta de saldo de combustível e gestão de abastecimento para condutores e coordenadores da frota COMPESA-GPM. O aplicativo permite visualizar em tempo real o saldo disponível de cada veículo, acompanhar métricas consolidadas da frota e solicitar transferências de crédito entre veículos.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura e Stack Tecnológica](#arquitetura-e-stack-tecnológica)
- [Requisitos Funcionais](#requisitos-funcionais)
- [Casos de Teste de Software](#casos-de-teste-de-software)
- [Requisitos de Infraestrutura](#requisitos-de-infraestrutura)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Licença](#licença)

---

## Visão Geral

O **Frota GPM** é uma aplicação web progressiva (PWA) desenvolvida para atender condutores e gestores de frota da COMPESA. O sistema consome dados do banco de dados Supabase — alimentado periodicamente a partir de planilhas internas — e apresenta informações como saldo de combustível, limites de período, valores utilizados/reservados, modelo, fabricante e tipo de frota para cada veículo.

O app funciona 100% no navegador, pode ser instalado na tela inicial de smartphones (iOS/Android) e envia **notificações push** via OneSignal sempre que o saldo da frota é atualizado.

---

## Funcionalidades

### 1. Consulta de Saldo de Combustível
- Exibição do saldo atual, limite corrente, limite do próximo período, valor utilizado e valor reservado por veículo.
- Gauge visual com indicador percentual de consumo.
- Badge de coordenação com cores dinâmicas.

### 2. Modos de Visualização
- **Cards** — layout em grid responsivo com cards individuais por veículo.
- **Tabela** — visão tabular compacta para análise rápida.
- **Carrossel** — navegação horizontal entre veículos (ideal para mobile).

### 3. Filtros e Ordenação
- Filtro por coordenação (múltipla seleção).
- Busca por placa ou modelo.
- Ordenação por placa, saldo ou coordenação (ascendente/descendente).

### 4. Abas de Frota
- **Frota Geral** — veículos vinculados a coordenações.
- **Indefinidos** — veículos sem coordenação definida.
- **Favoritos** — veículos marcados pelo usuário (persistidos localmente).

### 5. Dashboard — Central de Inteligência (`/dashboard`)
- 8 cards de resumo: total de veículos, saldo total, veículos com saldo zero, veículos com saldo positivo, entre outros.
- Gráficos interativos (Recharts): distribuição por tipo de frota, tipo de combustível, coordenação, modelo e fabricante.
- Gráfico de linhas de saldo por coordenação.
- Tabela detalhada exportável.
- Exportação para **XLSX**, **ODS** e **PDF**.

### 6. Solicitação de Transferência de Saldo
- Modal wizard de dois passos acessível via FAB Menu.
- Seleção de veículos de origem/destino com feedback de saldo em tempo real.
- Validação de saldo disponível (impede transferência superior ao saldo).
- Envio via **WhatsApp** (prioritário) ou **E-mail** ao gestor de frota.
- Prévia editável da mensagem com opção de restaurar texto original.
- Reordenação manual de blocos (drag-and-drop em desktop, setas em mobile).

### 7. FAB Menu (Floating Action Button)
- Acesso rápido a:
  - Instruções de iButtons (como ligar o veículo).
  - Mapa de postos credenciados.
  - GAD Manutenção (dashboard Power BI).
  - CRLVs digitais.
  - Solicitação de transferência de saldo.

### 8. Notificações Push
- Integração com **OneSignal** para push notifications via web.
- Trigger automático via database trigger no Supabase quando `vehicle_data` é atualizado.
- Edge Function (`send-push-notification`) envia notificação a todos os dispositivos inscritos.

### 9. Dica do Dia
- Edge Function (`get-driving-tips`) busca dicas de direção segura de uma Google Sheets.
- Exibida como toast flutuante na interface.

### 10. PWA (Progressive Web App)
- Instalação na tela inicial (iOS e Android).
- Prompt de instalação customizado.
- Detecção e prompt de atualização automática.
- Manifest com ícones, shortcuts e categorias.

### 11. Exportação de Saldo
- Gera texto formatado com saldo por veículo e totais por coordenação.
- Mobile: compartilhamento via Web Share API.
- Desktop: cópia para área de transferência.

### 12. Sincronização em Tempo Real
- Realtime subscription via Supabase para atualização automática dos dados sem reload.
- Indicador visual de status de sincronização no cabeçalho.
- Selo de última atualização.

---

## Arquitetura e Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Framework** | React 18 + Vite 5 |
| **Linguagem** | TypeScript |
| **Estilização** | Tailwind CSS + shadcn/ui |
| **Animações** | Framer Motion |
| **Gráficos** | Recharts |
| **Banco de Dados** | Supabase (PostgreSQL) |
| **Realtime** | Supabase Realtime (WebSocket) |
| **Edge Functions** | Supabase Edge Functions (Deno) |
| **Push Notifications** | OneSignal (Web Push) |
| **Roteamento** | React Router v6 |
| **Estado Servidor** | TanStack React Query |
| **Exportação** | jsPDF, jspdf-autotable, xlsx |
| **Deploy** | Lovable Cloud / Vercel |

### Estrutura de Diretórios

```
src/
├── components/
│   ├── dashboard/       # Gráficos e cards do dashboard
│   ├── frota/           # Componentes da tela principal (veículos)
│   ├── layout/          # Header, Footer, DashboardLayout
│   ├── pwa/             # InstallPrompt, UpdatePrompt, OneSignal
│   └── ui/              # Componentes base (shadcn/ui)
├── hooks/               # Custom hooks (useVehicles, useCoordinations, etc.)
├── integrations/        # Cliente Supabase e tipos gerados
├── lib/                 # Utilitários (balance, fuel, whatsapp, export)
├── pages/               # Páginas (Index, Dashboard, NotFound)
├── types/               # Tipos TypeScript (vehicle.ts)
└── test/                # Configuração e testes

supabase/
└── functions/
    ├── send-push-notification/   # Edge Function de push via OneSignal
    └── get-driving-tips/         # Edge Function de dicas de direção
```

---

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | O sistema deve exibir o saldo de combustível em tempo real para cada veículo da frota. | Alta |
| RF-02 | O sistema deve permitir filtrar veículos por coordenação (seleção múltipla). | Alta |
| RF-03 | O sistema deve permitir buscar veículos por placa ou modelo. | Alta |
| RF-04 | O sistema deve oferecer três modos de visualização: cards, tabela e carrossel. | Média |
| RF-05 | O sistema deve separar veículos em abas: Frota Geral, Indefinidos e Favoritos. | Média |
| RF-06 | O sistema deve permitir marcar/desmarcar veículos como favoritos com persistência local. | Média |
| RF-07 | O sistema deve ordenar veículos por placa, saldo ou coordenação (asc/desc). | Média |
| RF-08 | O sistema deve exibir um dashboard com métricas consolidadas: total de veículos, saldo total, distribuição por tipo, fabricante, modelo e coordenação. | Alta |
| RF-09 | O sistema deve permitir exportar dados do dashboard em XLSX, ODS e PDF. | Média |
| RF-10 | O sistema deve permitir solicitar transferência de saldo entre veículos via modal wizard. | Alta |
| RF-11 | O sistema deve enviar a solicitação de transferência via WhatsApp (prioritário) ou E-mail ao gestor de frota. | Alta |
| RF-12 | O sistema deve validar que o valor de transferência não exceda o saldo disponível do veículo de origem. | Alta |
| RF-13 | O sistema deve enviar notificações push a todos os dispositivos inscritos quando o saldo da frota for atualizado. | Alta |
| RF-14 | O sistema deve exibir uma dica de direção segura aleatória (obtida de planilha externa). | Baixa |
| RF-15 | O sistema deve funcionar como PWA instalável em iOS e Android. | Alta |
| RF-16 | O sistema deve atualizar os dados automaticamente via Supabase Realtime (sem necessidade de reload manual). | Alta |
| RF-17 | O sistema deve exibir indicadores visuais de status de sincronização e timestamp da última atualização. | Média |
| RF-18 | O sistema deve permitir exportar/compartilhar o saldo da frota em formato texto (Web Share API no mobile, clipboard no desktop). | Média |
| RF-19 | O sistema deve exibir gauge visual com percentual de consumo de saldo por veículo. | Média |
| RF-20 | O sistema deve persistir preferências do usuário (modo de visualização, filtros, aba ativa, favoritos) em localStorage. | Média |

---

## Casos de Teste de Software

### CT-01 — Carregamento Inicial de Veículos
| Item | Detalhe |
|---|---|
| **Pré-condição** | Banco de dados `vehicle_data` populado; Supabase acessível. |
| **Passos** | 1. Acessar a URL raiz (`/`). |
| **Resultado Esperado** | Lista de veículos é carregada com saldo, modelo e coordenação. Skeletons são exibidos durante o carregamento. Indicador de sincronização fica ativo e, ao concluir, muda para "sincronizado". |

### CT-02 — Filtro por Coordenação
| Item | Detalhe |
|---|---|
| **Pré-condição** | Veículos carregados com múltiplas coordenações. |
| **Passos** | 1. Clicar em um chip de coordenação. 2. Clicar em outro chip. 3. Clicar em "Limpar filtros". |
| **Resultado Esperado** | Apenas veículos da(s) coordenação(ões) selecionada(s) são exibidos. Ao limpar, todos voltam. |

### CT-03 — Busca por Placa
| Item | Detalhe |
|---|---|
| **Pré-condição** | Veículos carregados. |
| **Passos** | 1. Digitar parte de uma placa no campo de busca (ex: "ABC"). |
| **Resultado Esperado** | Apenas veículos cuja placa contém "ABC" são exibidos. Ao apagar o texto, todos voltam. |

### CT-04 — Alternância de Modo de Visualização
| Item | Detalhe |
|---|---|
| **Pré-condição** | Veículos carregados. |
| **Passos** | 1. Clicar no ícone de tabela. 2. Clicar no ícone de carrossel. 3. Clicar no ícone de cards. |
| **Resultado Esperado** | A visualização alterna corretamente entre tabela, carrossel e cards. Preferência é persistida ao recarregar a página. |

### CT-05 — Marcar/Desmarcar Favorito
| Item | Detalhe |
|---|---|
| **Pré-condição** | Veículos carregados; aba "Frota Geral" ativa. |
| **Passos** | 1. Clicar no ícone de estrela de um veículo. 2. Navegar para aba "Favoritos". 3. Clicar novamente na estrela para remover. |
| **Resultado Esperado** | Veículo aparece/desaparece na aba Favoritos. O contador no badge é atualizado. A seleção persiste após reload. |

### CT-06 — Dashboard: Cards de Resumo
| Item | Detalhe |
|---|---|
| **Pré-condição** | Dados de veículos carregados. |
| **Passos** | 1. Navegar para `/dashboard`. |
| **Resultado Esperado** | 8 cards de resumo exibem dados corretos: total de veículos, saldo total, veículos com saldo zero e positivo, etc. |

### CT-07 — Dashboard: Exportação
| Item | Detalhe |
|---|---|
| **Pré-condição** | Dashboard carregado com dados. |
| **Passos** | 1. Clicar no botão de exportação. 2. Selecionar formato XLSX. 3. Repetir para ODS e PDF. |
| **Resultado Esperado** | Arquivo é gerado e baixado no formato selecionado sem erros. Toast de feedback é exibido. |

### CT-08 — Solicitação de Transferência de Saldo
| Item | Detalhe |
|---|---|
| **Pré-condição** | Gestor de frota cadastrado no banco (`gestor_frota`); veículos com saldo > 0. |
| **Passos** | 1. Abrir FAB Menu. 2. Clicar em "Transferência". 3. Preencher nome do solicitante. 4. Selecionar veículo de origem e destino. 5. Informar valor dentro do saldo disponível. 6. Avançar para passo 2. 7. Revisar prévia da mensagem. 8. Enviar via WhatsApp. |
| **Resultado Esperado** | Modal abre com feedback de saldo em tempo real. Validação impede valor > saldo. WhatsApp é aberto com mensagem pré-formatada. |

### CT-09 — Transferência: Validação de Saldo Insuficiente
| Item | Detalhe |
|---|---|
| **Pré-condição** | Veículo de origem com saldo de R$ 100,00. |
| **Passos** | 1. No modal de transferência, informar valor R$ 150,00. |
| **Resultado Esperado** | Sistema exibe feedback visual de saldo insuficiente e impede o avanço. |

### CT-10 — Notificações Push
| Item | Detalhe |
|---|---|
| **Pré-condição** | Dispositivo inscrito no OneSignal; Edge Function `send-push-notification` ativa. |
| **Passos** | 1. Atualizar um registro em `vehicle_data` no Supabase. |
| **Resultado Esperado** | Uma única notificação push é recebida no dispositivo com o título "COMPESA Frota GPM" e mensagem de atualização de saldo. |

### CT-11 — Instalação PWA (iOS)
| Item | Detalhe |
|---|---|
| **Pré-condição** | Acessar a aplicação via Safari no iOS. |
| **Passos** | 1. Aguardar o prompt de instalação customizado. 2. Seguir instruções (Compartilhar → Adicionar à Tela de Início). |
| **Resultado Esperado** | App é instalado na tela inicial com ícone e nome corretos. Abre em modo standalone. |

### CT-12 — Exportar/Compartilhar Saldo em Texto
| Item | Detalhe |
|---|---|
| **Pré-condição** | Veículos carregados. |
| **Passos** | 1. Clicar no botão "Enviar/Copiar". |
| **Resultado Esperado** | Mobile: Web Share API abre com texto formatado. Desktop: texto é copiado para clipboard com toast de confirmação. |

### CT-13 — Atualização em Tempo Real (Realtime)
| Item | Detalhe |
|---|---|
| **Pré-condição** | App aberto em um dispositivo; Supabase Realtime ativo. |
| **Passos** | 1. Alterar o saldo de um veículo diretamente no banco de dados. |
| **Resultado Esperado** | O saldo é atualizado automaticamente na interface sem reload. Indicador de "atualizado recentemente" é exibido. |

### CT-14 — Dica do Dia
| Item | Detalhe |
|---|---|
| **Pré-condição** | Edge Function `get-driving-tips` ativa; Google Sheets acessível. |
| **Passos** | 1. Acessar a aplicação. |
| **Resultado Esperado** | Uma dica de direção segura aleatória é exibida como toast flutuante. |

### CT-15 — Persistência de Preferências
| Item | Detalhe |
|---|---|
| **Pré-condição** | App carregado. |
| **Passos** | 1. Alterar modo de visualização para "Tabela". 2. Selecionar uma coordenação. 3. Recarregar a página. |
| **Resultado Esperado** | Modo de visualização permanece "Tabela" e coordenação permanece selecionada após reload. |

---

## Requisitos de Infraestrutura

### Ambiente de Produção

| Componente | Especificação |
|---|---|
| **Hosting** | Lovable Cloud ou Vercel (static site / SPA) |
| **CDN** | Incluso no Vercel/Lovable (edge caching global) |
| **SSL/TLS** | Certificado HTTPS automático (Let's Encrypt) |
| **Domínio** | `frotagpm.lovable.app` (produção) |

### Supabase

| Componente | Especificação |
|---|---|
| **Projeto** | `xsavrqjqiqohqxcnrjes` |
| **Banco de Dados** | PostgreSQL 15+ gerenciado pelo Supabase |
| **Tabelas Principais** | `vehicle_data`, `vehicles`, `coordinations`, `vehicle_images`, `gestor_frota`, `push_notifications_log`, `push_subscriptions`, `user_preferences`, `bd_ativo` |
| **Realtime** | Habilitado para a tabela `vehicle_data` (canal de broadcast/presence) |
| **Edge Functions** | 2 funções ativas: `send-push-notification`, `get-driving-tips` |
| **Row Level Security** | RLS habilitado nas tabelas sensíveis |
| **Database Triggers** | Trigger `on_vehicle_data_update` em `vehicle_data` para disparo de push notifications |

### Edge Functions — Variáveis de Ambiente (Secrets)

| Variável | Descrição |
|---|---|
| `ONESIGNAL_APP_ID` | ID do app OneSignal |
| `ONESIGNAL_REST_API_KEY` | Chave da REST API do OneSignal |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de service role (usada na Edge Function de push) |

### OneSignal (Push Notifications)

| Componente | Especificação |
|---|---|
| **Plataforma** | Web Push (Safari, Chrome, Firefox, Edge) |
| **Service Worker** | `OneSignalSDKWorker.js` na raiz pública |
| **Segmento** | `Total Subscriptions` (todos os inscritos) |
| **Tópico** | `fuel-balance-update` (coalescing de notificações duplicadas) |

### Requisitos do Navegador

| Requisito | Detalhe |
|---|---|
| **Navegadores Suportados** | Chrome 80+, Safari 16.4+ (iOS), Firefox 100+, Edge 80+ |
| **Service Worker** | Necessário para PWA e push notifications |
| **JavaScript** | ES2020+ (módulos ESM) |
| **HTTPS** | Obrigatório para Service Worker e Web Push |

### Requisitos de Build

| Componente | Versão Mínima |
|---|---|
| **Node.js** | 18.x |
| **npm** | 9.x |
| **Vite** | 5.x |
| **TypeScript** | 5.x |

---

## Desenvolvimento Local

```sh
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd frota-gpm

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento (Vite) |
| `npm run build` | Gera build de produção otimizado |
| `npm run build:dev` | Gera build em modo desenvolvimento |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Executa verificação ESLint |
| `npm run test` | Executa testes unitários (Vitest) |
| `npm run test:watch` | Executa testes em modo watch |

---

## Licença

Este projeto é de uso exclusivo da **COMPESA** — Companhia Pernambucana de Saneamento.
