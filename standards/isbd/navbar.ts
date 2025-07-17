// ISBD navbar configuration with multi-element set support
export default [
  {
    type: 'dropdown',
    label: 'Element Sets',
    position: 'left',
    items: [
      {
        label: 'ISBD Elements',
        to: '/docs/elements/isbd',
        activeBasePath: '/docs/elements/isbd',
      },
      {
        label: 'ISBD Unconstrained',
        to: '/docs/elements/unconstrained',
        activeBasePath: '/docs/elements/unconstrained',
      },
      {
        type: 'html',
        value: '<hr style="margin: 0.3rem 0;">',
      },
      {
        label: 'All Element Sets',
        to: '/docs/elements',
      },
    ],
  },
  {
    type: 'dropdown',
    label: 'Vocabularies',
    position: 'left',
    items: [
      {
        label: 'Content Form',
        to: '/docs/vocabularies/contentform',
      },
      {
        label: 'Media Type',
        to: '/docs/vocabularies/mediatype',
      },
      {
        label: 'Content Qualification',
        to: '/docs/vocabularies/contentqualification',
      },
      {
        type: 'html',
        value: '<hr style="margin: 0.3rem 0;">',
      },
      {
        label: 'All Vocabularies',
        to: '/docs/vocabularies',
      },
    ],
  },
  {
    to: '/docs',
    label: 'Documentation',
    position: 'left',
  },
];