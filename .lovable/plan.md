

# 📱 Frota GPM - Plano de Implementação

## Visão Geral

Criar um **PWA mobile-first** para condutores da COMPESA consultarem informações de veículos e saldo de combustível em tempo real, com **acesso 100% read-only** ao banco de dados em produção.

---

## 🏗️ Estrutura da Aplicação

### Páginas
1. **Home (Dashboard Principal)**
   - Header fixo com logo COMPESA
   - Barra de filtros por coordenação
   - Toggle de visualização (Tabela/Card/Carrossel)
   - Listagem de veículos no modo selecionado

2. **Splash Screen / Loading**
   - Tela de carregamento inicial com branding

---

## 🎨 Funcionalidades Principais

### 1. Sistema de Filtros
- Chips de seleção múltipla por coordenação
- Cada coordenação exibida com sua cor identificadora
- Opção "Limpar filtros" sempre visível
- Preferências salvas automaticamente no localStorage

### 2. Três Modos de Visualização

**📊 Modo Tabela**
- Colunas: Placa, Modelo, Tipo, Coordenação, Saldo
- Rolagem horizontal em telas pequenas
- Linhas compactas para máxima densidade

**🎴 Modo Card**
- Grid responsivo (1 coluna mobile / 2-3 desktop)
- Foto do veículo em destaque
- Badge colorido da coordenação
- Saldo com indicador visual (verde/amarelo/vermelho)

**🔄 Modo Carrossel**
- Navegação por swipe (touch gestures)
- Um card grande por vez
- Setas de navegação em desktop
- Contador de posição

### 3. Indicadores Visuais de Saldo
- 🟢 **Verde**: Saldo acima de R$ 200
- 🟡 **Amarelo**: Saldo entre R$ 100 e R$ 200
- 🔴 **Vermelho**: Saldo abaixo de R$ 100

### 4. Atualizações em Tempo Real
- Supabase Realtime subscriptions
- Atualização automática quando gestores modificam saldos
- Indicador visual discreto de "Sincronizado"

---

## 📱 Configuração PWA

### Recursos
- Manifest.json com ícones para instalação
- Service Worker para cache de assets
- Tema auto (claro/escuro baseado no sistema)
- Meta tags para fullscreen no mobile

### Experiência Offline
- Cache das últimas consultas
- Mensagem amigável quando offline
- Tentativa automática de reconexão

---

## 🗂️ Persistência de Preferências

Usando localStorage para salvar:
- Último modo de visualização usado
- Filtros de coordenação selecionados
- Preferência de tema (se alterado manualmente)

---

## 🔒 Garantias de Segurança

### Acesso Read-Only
- Utilização exclusiva do cliente Supabase já configurado
- Apenas queries SELECT nas tabelas:
  - `vehicle_data` (dados de combustível)
  - `vehicles` (vinculação com coordenações)
  - `vehicle_images` (fotos)
  - `coordinations` (cores e nomes)
- Zero impacto no sistema administrativo existente

---

## 📐 Design Responsivo

### Mobile (320px - 768px)
- Header compacto
- Filtros em linha horizontal scrollável
- Cards em coluna única
- Botões de ação no tamanho touch-friendly (44px mínimo)

### Tablet/Desktop (768px+)
- Layout mais espaçado
- Grid de 2-3 cards
- Tabela com mais colunas visíveis

---

## 🎯 Resultado Esperado

Um aplicativo instalável que permite aos condutores:
1. Abrir rapidamente pelo ícone na home do celular
2. Filtrar veículos por sua coordenação
3. Visualizar saldo de combustível em tempo real
4. Trocar entre modos de visualização conforme preferência
5. Funcionar mesmo com conexão instável

