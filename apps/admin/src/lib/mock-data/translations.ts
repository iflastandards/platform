// Translation progress mock data

export interface TranslationProgress {
  id: string;
  namespace: string;
  languageCode: string;
  languageName: string;
  translator?: string;
  status: 'not_started' | 'in_progress' | 'review' | 'completed';
  progress: {
    total: number;
    translated: number;
    reviewed: number;
    approved: number;
  };
  lastUpdated: string;
  deadline?: string;
  notes?: string;
}

export const mockTranslations: TranslationProgress[] = [
  // ISBD translations
  {
    id: 'trans-isbd-fr',
    namespace: 'isbd',
    languageCode: 'fr',
    languageName: 'French',
    translator: 'Marie Dubois',
    status: 'completed',
    progress: {
      total: 185,
      translated: 185,
      reviewed: 185,
      approved: 185,
    },
    lastUpdated: '2024-11-20T00:00:00Z',
  },
  {
    id: 'trans-isbd-es',
    namespace: 'isbd',
    languageCode: 'es',
    languageName: 'Spanish',
    translator: 'Carlos García',
    status: 'review',
    progress: {
      total: 185,
      translated: 185,
      reviewed: 142,
      approved: 120,
    },
    lastUpdated: '2025-01-10T00:00:00Z',
    deadline: '2025-02-01T00:00:00Z',
  },
  {
    id: 'trans-isbd-de',
    namespace: 'isbd',
    languageCode: 'de',
    languageName: 'German',
    translator: 'Hans Mueller',
    status: 'in_progress',
    progress: {
      total: 185,
      translated: 156,
      reviewed: 98,
      approved: 98,
    },
    lastUpdated: '2025-01-08T00:00:00Z',
    deadline: '2025-03-01T00:00:00Z',
  },
  {
    id: 'trans-isbd-zh',
    namespace: 'isbd',
    languageCode: 'zh',
    languageName: 'Chinese',
    status: 'not_started',
    progress: {
      total: 185,
      translated: 0,
      reviewed: 0,
      approved: 0,
    },
    lastUpdated: '2025-01-01T00:00:00Z',
    notes: 'Seeking translator',
  },
  
  // LRM translations
  {
    id: 'trans-lrm-fr',
    namespace: 'lrm',
    languageCode: 'fr',
    languageName: 'French',
    translator: 'Pierre Martin',
    status: 'in_progress',
    progress: {
      total: 223,
      translated: 189,
      reviewed: 145,
      approved: 145,
    },
    lastUpdated: '2025-01-11T00:00:00Z',
    deadline: '2025-04-01T00:00:00Z',
  },
  
  // MulDiCat translations
  {
    id: 'trans-muldicat-fr',
    namespace: 'muldicat',
    languageCode: 'fr',
    languageName: 'French',
    translator: 'pierre.translator@bibliotheque.fr',
    status: 'in_progress',
    progress: {
      total: 2847,
      translated: 1851,
      reviewed: 1523,
      approved: 1523,
    },
    lastUpdated: '2025-01-11T00:00:00Z',
    deadline: '2025-03-15T00:00:00Z',
    notes: 'Batch 3 in progress',
  },
  {
    id: 'trans-muldicat-es',
    namespace: 'muldicat',
    languageCode: 'es',
    languageName: 'Spanish',
    translator: 'Ana Martinez',
    status: 'completed',
    progress: {
      total: 2847,
      translated: 2847,
      reviewed: 2847,
      approved: 2847,
    },
    lastUpdated: '2024-09-01T00:00:00Z',
  },
  {
    id: 'trans-muldicat-pt',
    namespace: 'muldicat',
    languageCode: 'pt',
    languageName: 'Portuguese',
    translator: 'João Silva',
    status: 'completed',
    progress: {
      total: 2847,
      translated: 2847,
      reviewed: 2847,
      approved: 2847,
    },
    lastUpdated: '2024-09-01T00:00:00Z',
  },
];

// Helper functions
export function getTranslationsForNamespace(namespace: string): TranslationProgress[] {
  return mockTranslations.filter(t => t.namespace === namespace);
}

export function getActiveTranslations(): TranslationProgress[] {
  return mockTranslations.filter(t => t.status === 'in_progress' || t.status === 'review');
}

export function getTranslationsByTranslator(email: string): TranslationProgress[] {
  return mockTranslations.filter(t => t.translator === email);
}

export function calculateTranslationPercentage(progress: TranslationProgress['progress']): number {
  if (progress.total === 0) return 0;
  return Math.round((progress.translated / progress.total) * 100);
}

export function getTranslationStatusColor(status: TranslationProgress['status']): string {
  switch (status) {
    case 'completed': return 'success';
    case 'review': return 'info';
    case 'in_progress': return 'warning';
    case 'not_started': return 'default';
  }
}

export function getLanguageFlag(languageCode: string): string {
  const flags: Record<string, string> = {
    'en': '🇬🇧',
    'fr': '🇫🇷',
    'es': '🇪🇸',
    'de': '🇩🇪',
    'pt': '🇵🇹',
    'zh': '🇨🇳',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'ar': '🇸🇦',
    'ru': '🇷🇺',
  };
  return flags[languageCode] || '🌐';
}

// Generate translation statistics
export function getTranslationStats() {
  const stats = {
    totalLanguages: new Set(mockTranslations.map(t => t.languageCode)).size,
    activeTranslations: mockTranslations.filter(t => t.status === 'in_progress').length,
    completedTranslations: mockTranslations.filter(t => t.status === 'completed').length,
    totalTermsTranslated: mockTranslations.reduce((sum, t) => sum + t.progress.translated, 0),
    upcomingDeadlines: mockTranslations
      .filter(t => t.deadline && new Date(t.deadline) > new Date())
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 3),
  };
  return stats;
}