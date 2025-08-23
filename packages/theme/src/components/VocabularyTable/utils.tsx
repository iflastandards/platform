import { 
  type MultilingualText, 
  type ConceptProps, 
  type CSVConceptRow, 
  type UriCaseStyle,
  type VocabularyTableProps,
  type TOCItem 
} from './types';

// Helper function to get text in a specific language with fallback
export const getLocalizedText = (
  text: string | MultilingualText | undefined,
  language: string,
  fallbackLanguage: string = 'en'
): string => {
  if (!text) {return '';}
  
  if (typeof text === 'string') {
    return text;
  }
  
  // Try requested language first
  if (text[language]) {
    const value = text[language];
    return Array.isArray(value) ? value[0] : value;
  }
  
  // Try fallback language
  if (text[fallbackLanguage]) {
    const value = text[fallbackLanguage];
    return Array.isArray(value) ? value[0] : value;
  }
  
  // Return first available language
  const firstAvailable = Object.values(text)[0];
  return Array.isArray(firstAvailable) ? firstAvailable[0] : firstAvailable || '';
};

// Helper function to get all localized text values (for properties that can have multiple values)
export const getAllLocalizedText = (
  text: string | MultilingualText | undefined,
  language: string,
  fallbackLanguage: string = 'en'
): string[] => {
  if (!text) {return [];}
  
  if (typeof text === 'string') {
    return [text];
  }
  
  // Try requested language first
  if (text[language]) {
    const value = text[language];
    return Array.isArray(value) ? value.filter(v => v && v.trim() !== '') : [value].filter(v => v && v.trim() !== '');
  }
  
  // Try fallback language
  if (text[fallbackLanguage]) {
    const value = text[fallbackLanguage];
    return Array.isArray(value) ? value.filter(v => v && v.trim() !== '') : [value].filter(v => v && v.trim() !== '');
  }
  
  // Return first available language
  const firstAvailable = Object.values(text)[0];
  if (firstAvailable) {
    return Array.isArray(firstAvailable) ? firstAvailable.filter(v => v && v.trim() !== '') : [firstAvailable].filter(v => v && v.trim() !== '');
  }
  
  return [];
};

// Helper function to parse CSV data into concepts
export const parseCSVToConcepts = (csvData: CSVConceptRow[]): ConceptProps[] => csvData.map(row => {
    const concept: ConceptProps = {
      value: {},
      definition: {},
      uri: row.uri
    };
    
    // Parse all columns with language tags
    Object.entries(row).forEach(([key, value]) => {
      if (!key.includes('@') || !value) {return;}
      
      const [property, langPart] = key.split('@');
      const langCode = langPart.split('[')[0]; // Remove array index
      const arrayIndex = langPart.includes('[') ? parseInt(langPart.split('[')[1].split(']')[0]) : 0;
      
      const cleanProperty = property.replace('skos:', '');
      let targetProperty: keyof ConceptProps;
      
      switch (cleanProperty) {
        case 'prefLabel':
          targetProperty = 'value';
          break;
        case 'definition':
          targetProperty = 'definition';
          break;
        case 'scopeNote':
          targetProperty = 'scopeNote';
          break;
        case 'notation':
          targetProperty = 'notation';
          break;
        case 'example':
          targetProperty = 'example';
          break;
        case 'changeNote':
          targetProperty = 'changeNote';
          break;
        case 'historyNote':
          targetProperty = 'historyNote';
          break;
        case 'editorialNote':
          targetProperty = 'editorialNote';
          break;
        case 'altLabel':
          targetProperty = 'altLabel';
          break;
        default:
          return;
      }
      
      if (!concept[targetProperty]) {
        concept[targetProperty] = {};
      }
      
      const target = concept[targetProperty] as MultilingualText;
      
      if (arrayIndex === 0) {
        target[langCode] = value;
      } else {
        // Handle multiple values for the same language
        if (!Array.isArray(target[langCode])) {
          target[langCode] = target[langCode] ? [target[langCode] as string] : [];
        }
        (target[langCode] as string[])[arrayIndex] = value;
      }
    });
    
    return concept;
  });

// Helper function to create slugs in different case styles
export const createSlug = (text: string, style: UriCaseStyle): string => {
  // First normalize the string (lowercase, remove special chars)
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  switch (style) {
    case 'kebab-case':
      return normalized;
    case 'snake_case':
      return normalized.replace(/-/g, '_');
    case 'camelCase':
      return normalized
        .split('-')
        .map((word, index) => 
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');
    case 'PascalCase':
      return normalized
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    default:
      return normalized;
  }
};

// Helper function to extract available languages from concepts
export const extractAvailableLanguages = (concepts: ConceptProps[]): string[] => {
  const languages = new Set<string>();
  
  concepts.forEach(concept => {
    Object.values(concept).forEach(value => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.keys(value).forEach(lang => languages.add(lang));
      }
    });
  });
  
  return Array.from(languages).sort();
};

// Generate TOC from vocabulary props
export const generateTOCFromProps = (props: VocabularyTableProps): TOCItem[] => {
  // Get defaults from global config if available
  let defaults: {
    prefix?: string;
    startCounter?: number;
    uriStyle?: "numeric" | "slug";
    caseStyle?: UriCaseStyle;
    defaultLanguage?: string;
  } = {};

  if (typeof window !== 'undefined' &&
      window.__DOCUSAURUS__ &&
      window.__DOCUSAURUS__.siteConfig &&
      window.__DOCUSAURUS__.siteConfig.customFields) {
    defaults = window.__DOCUSAURUS__.siteConfig.customFields.vocabularyDefaults || {};
  }

  const {
    concepts,
    RDF,
    csvData,
    startCounter,
    uriStyle,
    caseStyle,
    defaultLanguage,
    preferCsvData = false,
  } = props;

  // Use props with fallback to defaults, then hardcoded defaults
  const resolvedStartCounter = startCounter ?? defaults.startCounter ?? 1000;
  const resolvedUriStyle = uriStyle || defaults.uriStyle || 'numeric';
  const resolvedCaseStyle = caseStyle || defaults.caseStyle || 'kebab-case';
  const resolvedDefaultLanguage = defaultLanguage || defaults.defaultLanguage || 'en';

  // Determine the concepts array to use
  let conceptsArray: ConceptProps[];
  if (preferCsvData && csvData) {
    conceptsArray = parseCSVToConcepts(csvData);
  } else {
    conceptsArray = concepts || RDF?.values || [];
  }

  // Generate TOC items from the vocabulary values
  return conceptsArray.map((entry, index) => {
    const termId = resolvedStartCounter + index;
    let identifier;

    // Get the value in default language for TOC
    const valueText = getLocalizedText(entry.value, resolvedDefaultLanguage, 'en');

    if (resolvedUriStyle === 'numeric') {
      identifier = `t${termId}`;
    } else {
      identifier = createSlug(valueText, resolvedCaseStyle);
    }

    return {
      value: valueText,
      id: identifier,
      children: [],
      level: 3, // Set level to match h3 for proper TOC integration with Docusaurus
    };
  });
};

// CSV Export functionality
export const exportToCSV = (props: VocabularyTableProps): string => {
  const conceptsArray = props.concepts || props.RDF?.values || [];
  
  if (conceptsArray.length === 0) {
    return '';
  }

  // Extract all available languages
  const languages = extractAvailableLanguages(conceptsArray);
  
  // If no multilingual data found, default to 'en' to ensure content is exported
  const exportLanguages = languages.length > 0 ? languages : ['en'];
  
  // Build headers
  const headers = ['uri', 'rdf:type'];
  
  // Add multilingual headers for each SKOS property
  const properties = ['skos:prefLabel', 'skos:definition', 'skos:scopeNote', 'skos:altLabel', 'skos:notation', 'skos:example', 'skos:changeNote', 'skos:historyNote', 'skos:editorialNote'];
  
  properties.forEach(prop => {
    exportLanguages.forEach(lang => {
      headers.push(`${prop}@${lang}`);
    });
  });

  const rows: string[][] = [headers];
  
  conceptsArray.forEach((concept, index) => {
    const row: string[] = [];
    
    // URI and type
    const termId = (props.startCounter || 1000) + index;
    const uri = concept.uri || `${props.prefix || 'isbdm'}:${props.vocabularyId}#t${termId}`;
    row.push(uri);
    row.push('http://www.w3.org/2004/02/skos/core#Concept');
    
    // Add multilingual data
    properties.forEach(prop => {
      // Map SKOS properties to ConceptProps fields
      const skosToConceptMap: Record<string, keyof ConceptProps> = {
        'skos:prefLabel': 'value',
        'skos:definition': 'definition',
        'skos:scopeNote': 'scopeNote',
        'skos:altLabel': 'altLabel',
        'skos:notation': 'notation',
        'skos:example': 'example',
        'skos:changeNote': 'changeNote',
        'skos:historyNote': 'historyNote',
        'skos:editorialNote': 'editorialNote'
      };
      
      const conceptProp = skosToConceptMap[prop];
      const conceptValue = conceptProp ? concept[conceptProp] : undefined;
      
      exportLanguages.forEach(lang => {
        let cellValue = '';
        
        if (conceptValue) {
          if (typeof conceptValue === 'string') {
            // For simple strings, use the value for all languages
            cellValue = conceptValue;
          } else if (typeof conceptValue === 'object' && conceptValue[lang]) {
            const langValue = conceptValue[lang];
            cellValue = Array.isArray(langValue) ? langValue[0] : langValue;
          }
        }
        
        row.push(cellValue);
      });
    });
    
    rows.push(row);
  });
  
  // Convert to CSV string
  return rows.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n');
};