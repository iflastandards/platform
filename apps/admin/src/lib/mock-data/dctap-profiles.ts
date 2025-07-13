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
    id: 'isbd-minimum',
    name: 'ISBD Minimum Profile',
    namespace: 'isbd',
    version: '1.0.0',
    description: 'Minimum required fields for ISBD elements',
    lastModified: '2024-12-01T00:00:00Z',
    author: 'ISBD Review Group',
    status: 'approved',
    constraints: [
      {
        propertyID: 'rdf:type',
        propertyLabel: 'Type',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'IRI',
        valueConstraint: 'isbd:Element',
        valueConstraintType: 'picklist',
      },
      {
        propertyID: 'rdfs:label',
        propertyLabel: 'Label',
        mandatory: true,
        repeatable: true,
        valueNodeType: 'literal',
        valueConstraintType: 'languageTag',
        note: 'At least one label in English required',
      },
      {
        propertyID: 'dcterms:identifier',
        propertyLabel: 'Identifier',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        valueConstraintType: 'pattern',
        valueConstraint: '^[A-Z][0-9]{1,3}$',
        note: 'Element ID format: Letter + 1-3 digits',
      },
      {
        propertyID: 'skos:definition',
        propertyLabel: 'Definition',
        mandatory: true,
        repeatable: true,
        valueNodeType: 'literal',
        valueConstraintType: 'languageTag',
      },
      {
        propertyID: 'isbd:hasArea',
        propertyLabel: 'ISBD Area',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'IRI',
        valueConstraint: 'Area0|Area1|Area2|Area3|Area4|Area5|Area6|Area7|Area8',
        valueConstraintType: 'picklist',
      },
    ],
    templates: {
      element: '/templates/isbd-element.csv',
    },
  },
  {
    id: 'isbd-recommended',
    name: 'ISBD Recommended Profile',
    namespace: 'isbd',
    version: '1.0.0',
    description: 'Recommended fields for comprehensive ISBD elements',
    lastModified: '2024-12-01T00:00:00Z',
    author: 'ISBD Review Group',
    status: 'approved',
    constraints: [
      // Includes all minimum constraints plus:
      {
        propertyID: 'rdf:type',
        propertyLabel: 'Type',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'IRI',
        valueConstraint: 'isbd:Element',
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
        propertyID: 'dcterms:identifier',
        propertyLabel: 'Identifier',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'literal',
        valueConstraintType: 'pattern',
        valueConstraint: '^[A-Z][0-9]{1,3}$',
      },
      {
        propertyID: 'skos:definition',
        propertyLabel: 'Definition',
        mandatory: true,
        repeatable: true,
        valueNodeType: 'literal',
        valueConstraintType: 'languageTag',
      },
      {
        propertyID: 'isbd:hasArea',
        propertyLabel: 'ISBD Area',
        mandatory: true,
        repeatable: false,
        valueNodeType: 'IRI',
        valueConstraintType: 'picklist',
      },
      {
        propertyID: 'skos:scopeNote',
        propertyLabel: 'Scope Note',
        mandatory: false,
        repeatable: true,
        valueNodeType: 'literal',
        valueConstraintType: 'languageTag',
      },
      {
        propertyID: 'skos:example',
        propertyLabel: 'Example',
        mandatory: false,
        repeatable: true,
        valueNodeType: 'literal',
      },
      {
        propertyID: 'dcterms:isReplacedBy',
        propertyLabel: 'Replaced By',
        mandatory: false,
        repeatable: false,
        valueNodeType: 'IRI',
        note: 'For deprecated elements',
      },
      {
        propertyID: 'rdfs:seeAlso',
        propertyLabel: 'See Also',
        mandatory: false,
        repeatable: true,
        valueNodeType: 'IRI',
      },
    ],
    templates: {
      element: '/templates/isbd-element-full.csv',
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