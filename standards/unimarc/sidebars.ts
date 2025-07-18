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
      "label": "UNIMARC Overview"
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
          "label": "Control & Coded Fields",
          "items": [
            {
              "type": "doc",
              "id": "elements/ub0XX/index"
            },
            {
              "type": "doc",
              "id": "elements/ub1XX/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "Descriptive Fields",
          "items": [
            {
              "type": "doc",
              "id": "elements/ub2XX/index"
            },
            {
              "type": "doc",
              "id": "elements/ub3XX/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "Linking Fields",
          "items": [
            {
              "type": "doc",
              "id": "elements/ub41X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub42X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub43X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub44X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub45X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub46X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub47X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub48X/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "Subject & Added Entry Fields",
          "items": [
            {
              "type": "doc",
              "id": "elements/ub5XX/index"
            },
            {
              "type": "doc",
              "id": "elements/ub7XX/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "Holdings & Location Fields",
          "items": [
            {
              "type": "doc",
              "id": "elements/ub68X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub801/index"
            },
            {
              "type": "doc",
              "id": "elements/ub802/index"
            },
            {
              "type": "doc",
              "id": "elements/ub830/index"
            },
            {
              "type": "doc",
              "id": "elements/ub850/index"
            },
            {
              "type": "doc",
              "id": "elements/ub856/index"
            },
            {
              "type": "doc",
              "id": "elements/ub886/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "Material-Specific Fields",
          "items": [
            {
              "type": "doc",
              "id": "elements/ub60X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub61X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub62X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub66X/index"
            },
            {
              "type": "doc",
              "id": "elements/ub67X/index"
            },
            {
              "type": "doc",
              "id": "elements/altos/index"
            },
            {
              "type": "doc",
              "id": "elements/altos/index"
            },
            {
              "type": "doc",
              "id": "elements/satcat/index"
            },
            {
              "type": "doc",
              "id": "elements/cartcha/index"
            },
            {
              "type": "doc",
              "id": "elements/cartcol/index"
            },
            {
              "type": "doc",
              "id": "elements/cartfor/index"
            },
            {
              "type": "doc",
              "id": "elements/cartpro/index"
            },
            {
              "type": "doc",
              "id": "elements/altos/index"
            },
            {
              "type": "doc",
              "id": "elements/altos/index"
            },
            {
              "type": "doc",
              "id": "elements/altos/index"
            },
            {
              "type": "doc",
              "id": "elements/altos/index"
            },
            {
              "type": "doc",
              "id": "elements/cartret/index"
            },
            {
              "type": "doc",
              "id": "elements/cartrel/index"
            },
            {
              "type": "doc",
              "id": "elements/carttos/index"
            },
            {
              "type": "doc",
              "id": "elements/chm/index"
            },
            {
              "type": "doc",
              "id": "elements/continuingfreq/index"
            },
            {
              "type": "doc",
              "id": "elements/elecsmd/index"
            },
            {
              "type": "doc",
              "id": "elements/fom/index"
            },
            {
              "type": "doc",
              "id": "elements/tos/index"
            },
            {
              "type": "doc",
              "id": "elements/key/index"
            },
            {
              "type": "doc",
              "id": "elements/mop/index"
            },
            {
              "type": "doc",
              "id": "elements/tac/index"
            },
            {
              "type": "doc",
              "id": "elements/ter/index"
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
          "type": "category",
          "label": "Cartographic Materials",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/satcat/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartcha/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartcol/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartfor/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartpro/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartret/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartrel/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/carttos/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "Graphics",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/graphicsfd/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/graphicssmd/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/graphicstd/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "Sound Recordings",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundcut/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundmod/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundtec/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundrep/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundspe/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundtac/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundtaw/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundtyp/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/vismfs/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "General",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/chm/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/continuingfreq/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/fom/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/tos/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/key/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/mop/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/tac/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "Electronic Resources",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/elecsmd/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/ter/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "Three-Dimensional Materials",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/3dmat/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/3dsmd/index"
            }
          ]
        },
        {
          "type": "category",
          "label": "Visual Projections",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/visacc/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/viscol/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/visfov/index"
            },
            {
              "type": "doc",
              "id": "vocabularies/visfor/index"
            }
          ]
        }
      ]
    },
    {
      "type": "category",
      "label": "Tools & Resources",
      "items": [
        {
          "type": "doc",
          "id": "search"
        },
        {
          "type": "doc",
          "id": "cross-set-browser"
        },
        {
          "type": "doc",
          "id": "field-guide"
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
