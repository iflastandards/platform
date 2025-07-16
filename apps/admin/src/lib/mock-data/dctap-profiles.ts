// DCTAP (Dublin Core Tabular Application Profiles) mock data

export interface DctapConstraint {
  propertyID: string;
  propertyLabel: string;
  mandatory: boolean;
  repeatable: boolean;
  valueNodeType: 'IRI' | 'literal' | 'bnode';
  valueDatatype?: string;
  valueConstraint?: string;
  valueConstraintType?: 'picklist' | 'pattern' | 'languageTag' | 'minMaxLength' | 'minMaxValue';
  valueShape?: string;
  note?: string;
}

export interface MockDctapProfile {
  id: string;
  name: string;
  namespace: string;
  version: string;
  description: string;
  lastModified: string;
  author: string;
  status: 'draft' | 'approved' | 'deprecated';
  constraints: DctapConstraint[];
  templates: {
    element?: string;
    concept?: string;
  };
}

export const mockDctapProfiles: MockDctapProfile[] = [
  {
    id: 'isbd-elements',
    name: 'ISBD Elements Profile',
    namespace: 'isbd',
    version: '1.0.0',
    description: 'Profile for ISBD element sets',
    lastModified: '2025-01-16T00:00:00Z',
    author: 'ISBD Review Group',
    status: 'approved',
    constraints: [
      {
        propertyID: 'uri',
        propertyLabel: 'Element URI',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'IRI',
        valueConstraint: 'http://iflastandards.info/ns/isbd/elements/',
        valueConstraintType: 'pattern',
        note: 'The URI identifier of the element',
      },
      {
        propertyID: 'rdf:type',
        propertyLabel: 'RDF Type',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'IRI',
        valueConstraint: 'owl:Class|rdf:Property',
        valueConstraintType: 'picklist',
      },
      {
        propertyID: 'rdfs:label@en',
        propertyLabel: 'Label (English)',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        valueDatatype: 'langString',
        valueConstraintType: 'languageTag',
        note: 'The label/name of the element in English',
      },
      {
        propertyID: 'skos:definition@en',
        propertyLabel: 'Definition (English)',
        mandatory: true,
        repeatable: true,
        valueNodeType: 'literal',
        valueDatatype: 'langString',
        valueConstraintType: 'languageTag',
        note: 'Full definition of the element in English',
      },
      {
        propertyID: 'reg:status',
        propertyLabel: 'Publication Status',
        mandatory: false,
        repeatable: false,
        valueNodeType: 'IRI',
        valueConstraint: 'http://metadataregistry.org/uri/RegStatus/',
        valueConstraintType: 'pattern',
        note: 'The publication status of the element',
      },
    ],
    templates: {
      element: '/standards/ISBD/static/data/DCTAP/isbd-elements-profile.csv',
    },
  },
  {
    id: 'isbd-concepts',
    name: 'ISBD Concepts Profile',
    namespace: 'isbd',
    version: '1.0.0',
    description: 'Profile for ISBD concept schemes',
    lastModified: '2025-01-16T00:00:00Z',
    author: 'ISBD Review Group',
    status: 'approved',
    constraints: [
      {
        propertyID: 'uri',
        propertyLabel: 'Concept URI',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'IRI',
        valueConstraint: 'http://iflastandards.info/ns/isbd/terms/',
        valueConstraintType: 'pattern',
        note: 'The URI identifier of the concept',
      },
      {
        propertyID: 'rdf:type',
        propertyLabel: 'RDF Type',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'IRI',
        valueConstraint: 'skos:Concept',
        valueConstraintType: 'picklist',
      },
      {
        propertyID: 'skos:inScheme',
        propertyLabel: 'In Scheme',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'IRI',
        note: 'Reference to the parent ConceptScheme',
      },
      {
        propertyID: 'skos:prefLabel@en',
        propertyLabel: 'Preferred Label (English)',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        valueDatatype: 'langString',
        valueConstraintType: 'languageTag',
        note: 'Preferred label in English - max one per language',
      },
      {
        propertyID: 'skos:definition@en',
        propertyLabel: 'Definition (English)',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        valueDatatype: 'langString',
        valueConstraintType: 'languageTag',
        note: 'Definition of the concept in English',
      },
    ],
    templates: {
      concept: '/standards/ISBD/static/data/DCTAP/isbd-concepts-profile.csv',
    },
  },
  {
    id: 'lrm-minimum',
    name: 'LRM Minimum Profile',
    namespace: 'lrm',
    version: '1.0.0',
    description: 'Minimum fields for LRM entities and relationships',
    lastModified: '2023-08-01T00:00:00Z',
    author: 'BCM Committee',
    status: 'approved',
    constraints: [
      {
        propertyID: 'rdf:type',
        propertyLabel: 'Type',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'IRI',
        valueConstraint: 'lrm:Entity|lrm:Attribute|lrm:Relationship',
        valueConstraintType: 'picklist',
      },
      {
        propertyID: 'rdfs:label',
        propertyLabel: 'Label',
        mandatory: true,
        repeatable: true,
        valueNodeType: 'literal',
        valueConstraintType: 'languageTag',
      },
      {
        propertyID: 'lrm:number',
        propertyLabel: 'LRM Number',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        valueConstraintType: 'pattern',
        valueConstraint: '^LRM-[EAR][0-9]+$',
        note: 'Format: LRM-E1, LRM-A12, LRM-R5',
      },
      {
        propertyID: 'skos:definition',
        propertyLabel: 'Definition',
        mandatory: true,
        repeatable: true,
        valueNodeType: 'literal',
        valueConstraintType: 'languageTag',
      },
    ],
    templates: {
      element: '/templates/lrm-entity.csv',
      concept: '/templates/lrm-concept.csv',
    },
  },
  {
    id: 'muldicat-translation',
    name: 'MulDiCat Translation Profile',
    namespace: 'muldicat',
    version: '2.0.0',
    description: 'Profile for multilingual term translations',
    lastModified: '2024-06-01T00:00:00Z',
    author: 'Cataloguing Section',
    status: 'approved',
    constraints: [
      {
        propertyID: 'skos:prefLabel',
        propertyLabel: 'Preferred Label',
        mandatory: true,
        repeatable: true,
        valueNodeType: 'literal',
        valueConstraintType: 'languageTag',
        note: 'One per language',
      },
      {
        propertyID: 'skos:altLabel',
        propertyLabel: 'Alternative Label',
        mandatory: false,
        repeatable: true,
        valueNodeType: 'literal',
        valueConstraintType: 'languageTag',
      },
      {
        propertyID: 'dcterms:source',
        propertyLabel: 'Source',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        note: 'Source of translation',
      },
      {
        propertyID: 'dcterms:created',
        propertyLabel: 'Date Created',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        valueDatatype: 'xsd:date',
      },
      {
        propertyID: 'dcterms:contributor',
        propertyLabel: 'Translator',
        mandatory: true,
        repeatable: true,
        valueNodeType: 'literal',
      },
    ],
    templates: {
      concept: '/templates/muldicat-translation.csv',
    },
  },
  {
    id: 'unimarc-fields',
    name: 'UNIMARC Field Definition',
    namespace: 'unimarc',
    version: '1.5.0',
    description: 'Profile for UNIMARC field and subfield definitions',
    lastModified: '2024-03-15T00:00:00Z',
    author: 'UNIMARC Strategic Programme',
    status: 'approved',
    constraints: [
      {
        propertyID: 'marc:tag',
        propertyLabel: 'Field Tag',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        valueConstraintType: 'pattern',
        valueConstraint: '^[0-9]{3}$',
        note: '3-digit field tag',
      },
      {
        propertyID: 'rdfs:label',
        propertyLabel: 'Field Name',
        mandatory: true,
        repeatable: true,
        valueNodeType: 'literal',
        valueConstraintType: 'languageTag',
      },
      {
        propertyID: 'marc:repeatable',
        propertyLabel: 'Repeatable',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        valueDatatype: 'xsd:boolean',
      },
      {
        propertyID: 'marc:mandatory',
        propertyLabel: 'Mandatory',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        valueDatatype: 'xsd:boolean',
      },
      {
        propertyID: 'marc:indicators',
        propertyLabel: 'Indicators',
        mandatory: false,
        repeatable: false,
        valueNodeType: 'literal',
        valueConstraintType: 'pattern',
        valueConstraint: '^[0-9#]{2}$',
      },
    ],
    templates: {
      element: '/templates/unimarc-field.csv',
    },
  },
];

// Helper functions
export function getProfilesForNamespace(namespace: string): MockDctapProfile[] {
  return mockDctapProfiles.filter(p => p.namespace === namespace);
}

export function getProfileById(profileId: string): MockDctapProfile | undefined {
  return mockDctapProfiles.find(p => p.id === profileId);
}

export function validateAgainstProfile(
  data: Record<string, any>,
  profileId: string
): { valid: boolean; errors: string[] } {
  const profile = getProfileById(profileId);
  if (!profile) {
    return { valid: false, errors: ['Profile not found'] };
  }

  const errors: string[] = [];

  profile.constraints.forEach(constraint => {
    const value = data[constraint.propertyID];

    // Check mandatory fields
    if (constraint.mandatory && !value) {
      errors.push(`Missing required field: ${constraint.propertyLabel}`);
      return;
    }

    // Check repeatability
    if (!constraint.repeatable && Array.isArray(value) && value.length > 1) {
      errors.push(`Field not repeatable: ${constraint.propertyLabel}`);
    }

    // Check value constraints
    if (value && constraint.valueConstraintType) {
      switch (constraint.valueConstraintType) {
        case 'pattern':
          const pattern = new RegExp(constraint.valueConstraint!);
          if (!pattern.test(value)) {
            errors.push(`Invalid format for ${constraint.propertyLabel}: expected ${constraint.valueConstraint}`);
          }
          break;
        case 'picklist':
          const validValues = constraint.valueConstraint!.split('|');
          if (!validValues.includes(value)) {
            errors.push(`Invalid value for ${constraint.propertyLabel}: must be one of ${validValues.join(', ')}`);
          }
          break;
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Generate empty template based on profile
export function generateTemplateFromProfile(profileId: string): Record<string, any> {
  const profile = getProfileById(profileId);
  if (!profile) return {};

  const template: Record<string, any> = {};
  
  profile.constraints.forEach(constraint => {
    if (constraint.mandatory) {
      template[constraint.propertyID] = constraint.repeatable ? [] : '';
    }
  });

  return template;
}