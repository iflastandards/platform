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
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/satcat"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartcha"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartcol"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartfor"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartpro"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartret"
            },
            {
              "type": "doc",
              "id": "vocabularies/cartrel"
            },
            {
              "type": "doc",
              "id": "vocabularies/carttos"
            }
          ]
        },
        {
          "type": "category",
          "label": "Graphics",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/graphicsfd"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/graphicssmd"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/graphicstd"
            }
          ]
        },
        {
          "type": "category",
          "label": "Sound Recordings",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/altos"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundcut"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundmod"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundtec"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundrep"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundspe"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundtac"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundtaw"
            },
            {
              "type": "doc",
              "id": "vocabularies/soundtyp"
            },
            {
              "type": "doc",
              "id": "vocabularies/vismfs"
            }
          ]
        },
        {
          "type": "category",
          "label": "General",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/chm"
            },
            {
              "type": "doc",
              "id": "vocabularies/continuingfreq"
            },
            {
              "type": "doc",
              "id": "vocabularies/fom"
            },
            {
              "type": "doc",
              "id": "vocabularies/tos"
            },
            {
              "type": "doc",
              "id": "vocabularies/key"
            },
            {
              "type": "doc",
              "id": "vocabularies/mop"
            },
            {
              "type": "doc",
              "id": "vocabularies/tac"
            }
          ]
        },
        {
          "type": "category",
          "label": "Electronic Resources",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/elecsmd"
            },
            {
              "type": "doc",
              "id": "vocabularies/ter"
            }
          ]
        },
        {
          "type": "category",
          "label": "Three-Dimensional Materials",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/3dmat"
            },
            {
              "type": "doc",
              "id": "vocabularies/3dsmd"
            }
          ]
        },
        {
          "type": "category",
          "label": "Visual Projections",
          "items": [
            {
              "type": "doc",
              "id": "vocabularies/visacc"
            },
            {
              "type": "doc",
              "id": "vocabularies/viscol"
            },
            {
              "type": "doc",
              "id": "vocabularies/visfov"
            },
            {
              "type": "doc",
              "id": "vocabularies/visfor"
            }
          ]
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
