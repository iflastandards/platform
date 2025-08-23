import { useMemo } from 'react';
import { type ConceptProps, type LanguageConfig, DEFAULT_LANGUAGE_CONFIG } from '../types';
import { getLocalizedText, extractAvailableLanguages } from '../utils';

interface UseMultilingualTextConfig {
  concepts: ConceptProps[];
  currentLanguage: string;
  defaultLanguage: string;
  availableLanguages?: string[];
  languageConfig?: LanguageConfig[];
}

interface UseMultilingualTextReturn {
  localizedConcepts: Array<{
    value: string;
    definition: string;
    scopeNote: string;
    notation: string;
    example: string;
    changeNote: string;
    historyNote: string;
    editorialNote: string;
    altLabel: string;
    originalConcept: ConceptProps;
  }>;
  detectedLanguages: string[];
  resolvedAvailableLanguages: string[];
  getLanguageDisplayName: (code: string) => string;
}

export function useMultilingualText({
  concepts,
  currentLanguage,
  defaultLanguage,
  availableLanguages,
  languageConfig = DEFAULT_LANGUAGE_CONFIG
}: UseMultilingualTextConfig): UseMultilingualTextReturn {
  
  // Extract available languages from the data
  const detectedLanguages = useMemo(() => extractAvailableLanguages(concepts), [concepts]);

  const resolvedAvailableLanguages = availableLanguages || detectedLanguages || [defaultLanguage];

  // Localize all concepts to current language
  const localizedConcepts = useMemo(() => concepts.map(concept => ({
      value: getLocalizedText(concept.value, currentLanguage, defaultLanguage),
      definition: getLocalizedText(concept.definition, currentLanguage, defaultLanguage),
      scopeNote: getLocalizedText(concept.scopeNote, currentLanguage, defaultLanguage),
      notation: getLocalizedText(concept.notation, currentLanguage, defaultLanguage),
      example: getLocalizedText(concept.example, currentLanguage, defaultLanguage),
      changeNote: getLocalizedText(concept.changeNote, currentLanguage, defaultLanguage),
      historyNote: getLocalizedText(concept.historyNote, currentLanguage, defaultLanguage),
      editorialNote: getLocalizedText(concept.editorialNote, currentLanguage, defaultLanguage),
      altLabel: getLocalizedText(concept.altLabel, currentLanguage, defaultLanguage),
      originalConcept: concept,
    })), [concepts, currentLanguage, defaultLanguage]);

  // Get language display name function
  const getLanguageDisplayName = (code: string): string => {
    const config = languageConfig.find(lang => lang.code === code);
    return config ? `${config.nativeName} (${config.name})` : code.toUpperCase();
  };

  return {
    localizedConcepts,
    detectedLanguages,
    resolvedAvailableLanguages,
    getLanguageDisplayName
  };
}