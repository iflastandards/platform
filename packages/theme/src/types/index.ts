/**
 * Shared types for IFLA theme components
 */
import React from 'react';

export interface ElementSubType {
  uri: string;
  url: string;
  label: string;
}

export interface ElementSuperType {
  uri: string;
  url: string;
  label: string;
}

export interface RDFData {
  language?: string;
  label: string;
  definition: string;
  scopeNote?: string;
  domain?: string;
  range?: string;
  elementSubType?: ElementSubType[];
  elementSuperType?: ElementSuperType[];
  uri?: string;
  type?: string;
  status?: string;
  isDefinedBy?: string;
  subPropertyOf?: string[];
  equivalentProperty?: string[];
  inverseOf?: string[];
  deprecated?: boolean;
  deprecatedInVersion?: string;
  willBeRemovedInVersion?: string;
}

export interface VocabularyDefaults {
  prefix: string;
  startCounter: number;
  uriStyle: 'numeric' | 'kebab-case' | 'camelCase';
  numberPrefix: string;
  caseStyle: 'kebab-case' | 'camelCase' | 'PascalCase';
  showFilter: boolean;
  filterPlaceholder: string;
  showTitle: boolean;
  showURIs: boolean;
  showCSVErrors: boolean;
  profile: string;
  profileShapeId: string;
  RDF: RDFMetadata;
  elementDefaults: {
    uri: string;
    classPrefix: string;
    propertyPrefix: string;
    profile: string;
    profileShapeId: string;
  };
}

export interface IFLAThemeConfig {
  vocabularyDefaults?: VocabularyDefaults;
  branding?: {
    siteName?: string;
    logo?: string;
    organizationName?: string;
    projectUrl?: string;
  };
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  features?: {
    search?: boolean;
    darkMode?: boolean;
    versioning?: boolean;
    i18n?: boolean;
  };
}

export interface MultilingualText {
  [languageCode: string]: string;
}

export interface LanguageConfig {
  code: string;
  label: string;
  direction?: 'ltr' | 'rtl';
}

export interface CSVConceptRow {
  [key: string]: string;
}

export interface TOCItem {
  id: string;
  label: string;
  level: number;
  children?: TOCItem[];
}

export type UriCaseStyle =
  | 'kebab-case'
  | 'camelCase'
  | 'PascalCase'
  | 'numeric';

export interface RDFMetadata {
  language?: string;
  label?: string;
  definition?: string;
  uri?: string;
  type?: string;
  status?: string;
  deprecated?: boolean;
  deprecatedInVersion?: string;
  willBeRemovedInVersion?: string;
  domain?: string;
  range?: string;
  scopeNote?: string;
  isDefinedBy?: string;
  subPropertyOf?: string[];
  equivalentProperty?: string[];
  inverseOf?: string[];
  elementSubType?: ElementSubType[];
  elementSuperType?: ElementSuperType[];
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | ElementSubType[]
    | ElementSuperType[]
    | undefined;
}

export interface ConceptProps {
  id?: string;
  uri?: string;
  label?: MultilingualText | string;
  definition?: MultilingualText | string;
  scopeNote?: MultilingualText | string;
  broader?: string[];
  narrower?: string[];
  related?: string[];
  exactMatch?: string[];
  closeMatch?: string[];
  example?: MultilingualText | string;
  note?: MultilingualText | string;
  deprecated?: boolean;
  prefLabel?: MultilingualText | string;
  altLabel?: MultilingualText | string;
  hiddenLabel?: MultilingualText | string;
  notation?: string;
  inScheme?: string[];
  topConceptOf?: string[];
  scheme?: string;
  changeNote?: MultilingualText | string;
  definition_source?: string;
  editorialNote?: MultilingualText | string;
  historyNote?: MultilingualText | string;
  [key: string]: string | string[] | MultilingualText | boolean | undefined;
}

export interface VocabularyTableProps {
  csvUrl?: string;
  csvData?: CSVConceptRow[];
  vocabularyUri?: string;
  showFilter?: boolean;
  filterPlaceholder?: string;
  showTitle?: boolean;
  showURIs?: boolean;
  showCSVErrors?: boolean;
  profile?: string;
  profileShapeId?: string;
  uriStyle?: UriCaseStyle;
  caseStyle?: UriCaseStyle;
  prefix?: string;
  numberPrefix?: string;
  startCounter?: number;
  concepts?: ConceptProps[];
  title?: string;
  description?: string;
  className?: string;
  RDF?: RDFMetadata;
  allowDownload?: boolean;
  downloadFormats?: ('csv' | 'json' | 'ttl' | 'rdf' | 'jsonld')[];
  customFields?: string[];
  hideColumns?: string[];
  columnOrder?: string[];
  maxRows?: number;
  sortable?: boolean;
  defaultSort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  groupBy?: string;
  showGroupCounts?: boolean;
  compactMode?: boolean;
  highlightSearch?: boolean;
  showRowNumbers?: boolean;
  virtualScroll?: boolean;
  enableSelection?: boolean;
  onSelectionChange?: (selectedRows: ConceptProps[]) => void;
  onRowClick?: (concept: ConceptProps) => void;
  customRenderers?: {
    [columnName: string]: (
      value: string | string[] | MultilingualText | boolean | undefined,
      concept: ConceptProps,
    ) => React.ReactNode;
  };
  errorBoundary?: boolean;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  emptyComponent?: React.ComponentType;
}

export const DEFAULT_LANGUAGE_CONFIG: LanguageConfig = {
  code: 'en',
  label: 'English',
  direction: 'ltr',
};

// FrontMatter interfaces
export interface ElementFrontMatter {
  id?: string;
  title?: string;
  deprecated?: boolean;
  deprecatedInVersion?: string;
  willBeRemovedInVersion?: string;
  RDF?: RDFData;
  [key: string]: string | boolean | RDFData | undefined;
}

export interface AdaptedFrontMatter {
  RDF: RDFData;
}

export interface ElementDefaults {
  uri: string;
  classPrefix: string;
  propertyPrefix: string;
  profile?: string;
  profileShapeId?: string;
}

// Component props interfaces
export interface ElementReferenceProps {
  frontMatter: ElementFrontMatter;
}

export interface InLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  smartWrap?: boolean;
}

export interface OutLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export interface SeeAlsoProps {
  children: React.ReactNode;
  className?: string;
}

export interface MandatoryProps {
  children: React.ReactNode;
  className?: string;
}

export interface UniqueProps {
  children: React.ReactNode;
  className?: string;
}

export interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
}

export interface ExampleTableProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}
