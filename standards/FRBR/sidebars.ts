import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  "docs": [
    {
      "type": "doc",
      "id": "index",
      "label": "Overview"
    },
    {
      "type": "category",
      "label": "Element Sets",
      "link": {
        "type": "doc",
        "id": "elements/index"
      },
      "items": [
        {
          "type": "category",
          "label": "FRBR Models",
          "items": [
            {
              "type": "doc",
              "id": "elements/frad/index"
            },
            {
              "type": "doc",
              "id": "elements/frbrer/index"
            },
            {
              "type": "doc",
              "id": "elements/frbroo/index"
            },
            {
              "type": "doc",
              "id": "elements/frbsad/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "User Tasks",
          "items": [
            {
              "type": "doc",
              "id": "elements/frbrerusertask/index"
            },
            {
              "type": "doc",
              "id": "elements/frsadusertask/index"
            }
          ]
        }
      ]
    },
    {
      "type": "category",
      "label": "Vocabularies",
      "link": {
        "type": "doc",
        "id": "vocabularies/index"
      },
      "items": [
        {
          "type": "doc",
          "id": "vocabularies/frbrerusertask"
        },
        {
          "type": "doc",
          "id": "vocabularies/frsadusertask"
        }
      ]
    },
    {
      "type": "category",
      "label": "Documentation",
      "items": [
        {
          "type": "doc",
          "id": "introduction"
        },
        {
          "type": "doc",
          "id": "examples"
        },
        {
          "type": "doc",
          "id": "about"
        }
      ]
    }
  ]
};

export default sidebars;
