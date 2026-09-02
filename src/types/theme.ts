export type ThemeType = 'dark' | 'light';

export type ThemeId =
  | 'compesa-default'
  | 'bloomberg-amber'
  | 'linear-indigo'
  | 'grafana-emerald'
  | 'stripe-light'
  | 'crimson-titanium'
  | 'solaris-cyan';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  type: ThemeType;
  category: 'Oficial' | 'Financeiro' | 'Moderno' | 'Observabilidade' | 'Claro' | 'Performance';
  isDefault?: boolean;
  previewColors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
  };
  metaThemeColor: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'compesa-default',
    name: 'COMPESA Padrão',
    tagline: 'Azul Corporativo Oficial',
    description: 'Paleta corporativa oficial com azul COMPESA e interface escura balanceada de alta legibilidade.',
    type: 'dark',
    category: 'Oficial',
    isDefault: true,
    previewColors: {
      primary: '#0066B3',
      secondary: '#00D4FF',
      background: '#161A21',
      card: '#1C2028',
      text: '#F8FAFC',
      border: '#374151',
    },
    metaThemeColor: '#161A21',
  },
  {
    id: 'bloomberg-amber',
    name: 'Bloomberg Terminal',
    tagline: 'Ônix e Âmbar Financeiro',
    description: 'Inspirado em terminais financeiros de alta densidade. Preto profundo com acentos dourados e âmbar.',
    type: 'dark',
    category: 'Financeiro',
    previewColors: {
      primary: '#F59E0B',
      secondary: '#F97316',
      background: '#151009',
      card: '#1E1710',
      text: '#FDF6E2',
      border: '#3B3125',
    },
    metaThemeColor: '#151009',
  },
  {
    id: 'linear-indigo',
    name: 'Linear Midnight',
    tagline: 'Índigo Violeta & Ardósia',
    description: 'Design contemporâneo ultra-refinado com tons de ardósia espacial e destaques em índigo elétrico.',
    type: 'dark',
    category: 'Moderno',
    previewColors: {
      primary: '#6E6BF5',
      secondary: '#B168F9',
      background: '#0C0D18',
      card: '#141523',
      text: '#F5F5FD',
      border: '#333546',
    },
    metaThemeColor: '#0C0D18',
  },
  {
    id: 'grafana-emerald',
    name: 'Grafana Esmeralda',
    tagline: 'Observabilidade & Verde Mint',
    description: 'Estilo dashboard de telemetria e infraestrutura com fundo carbono e indicadores verde esmeralda.',
    type: 'dark',
    category: 'Observabilidade',
    previewColors: {
      primary: '#10B981',
      secondary: '#14B8A6',
      background: '#0D1412',
      card: '#131F1C',
      text: '#ECFDF5',
      border: '#223832',
    },
    metaThemeColor: '#0D1412',
  },
  {
    id: 'stripe-light',
    name: 'Stripe Alabaster',
    tagline: 'Claro Executivo de Alto Contraste',
    description: 'Modo claro cristalino e corporativo. Excelente para visualização externa sob luz solar direta.',
    type: 'light',
    category: 'Claro',
    previewColors: {
      primary: '#1D4ED8',
      secondary: '#0284C7',
      background: '#F8FAFC',
      card: '#FFFFFF',
      text: '#0F172A',
      border: '#CBD5E1',
    },
    metaThemeColor: '#F8FAFC',
  },
  {
    id: 'crimson-titanium',
    name: 'Titânio Carmesim',
    tagline: 'Rubi Carmesim & Titânio',
    description: 'Atmosfera esportiva e precisa com fundo grafite titânio e acentos carmesim de alta voltagem.',
    type: 'dark',
    category: 'Performance',
    previewColors: {
      primary: '#F43F5E',
      secondary: '#FB7185',
      background: '#121214',
      card: '#1A1A1E',
      text: '#FAFAFA',
      border: '#323238',
    },
    metaThemeColor: '#121214',
  },
  {
    id: 'solaris-cyan',
    name: 'Solaris Cyber',
    tagline: 'Ciano-Magenta Neon & Void',
    description: 'Atmosfera cyberpunk de alta intensidade: fundo quase negro, ciano neon elétrico e magenta como contraste cromático.',
    type: 'dark',
    category: 'Moderno',
    previewColors: {
      primary: '#00E5FF',
      secondary: '#F472ED',
      background: '#05080C',
      card: '#0A1420',
      text: '#F0FCFE',
      border: '#1F3347',
    },
    metaThemeColor: '#05080C',
  },
];

export const DEFAULT_THEME_ID: ThemeId = 'compesa-default';

export function getThemeConfig(id?: string | null): ThemeConfig {
  const found = THEMES.find((t) => t.id === id);
  return found || THEMES[0];
}
