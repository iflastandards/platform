import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/newtest/__docusaurus/debug',
    component: ComponentCreator('/newtest/__docusaurus/debug', '0bf'),
    exact: true
  },
  {
    path: '/newtest/__docusaurus/debug/config',
    component: ComponentCreator('/newtest/__docusaurus/debug/config', '9c5'),
    exact: true
  },
  {
    path: '/newtest/__docusaurus/debug/content',
    component: ComponentCreator('/newtest/__docusaurus/debug/content', '5af'),
    exact: true
  },
  {
    path: '/newtest/__docusaurus/debug/globalData',
    component: ComponentCreator('/newtest/__docusaurus/debug/globalData', '4a6'),
    exact: true
  },
  {
    path: '/newtest/__docusaurus/debug/metadata',
    component: ComponentCreator('/newtest/__docusaurus/debug/metadata', 'ddb'),
    exact: true
  },
  {
    path: '/newtest/__docusaurus/debug/registry',
    component: ComponentCreator('/newtest/__docusaurus/debug/registry', '579'),
    exact: true
  },
  {
    path: '/newtest/__docusaurus/debug/routes',
    component: ComponentCreator('/newtest/__docusaurus/debug/routes', 'b94'),
    exact: true
  },
  {
    path: '/newtest/search',
    component: ComponentCreator('/newtest/search', '748'),
    exact: true
  },
  {
    path: '/newtest/docs',
    component: ComponentCreator('/newtest/docs', '761'),
    routes: [
      {
        path: '/newtest/docs',
        component: ComponentCreator('/newtest/docs', 'ad1'),
        routes: [
          {
            path: '/newtest/docs',
            component: ComponentCreator('/newtest/docs', 'f12'),
            routes: [
              {
                path: '/newtest/docs/getting-started/overview',
                component: ComponentCreator('/newtest/docs/getting-started/overview', '49d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/newtest/docs/intro',
                component: ComponentCreator('/newtest/docs/intro', 'c30'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/newtest/',
    component: ComponentCreator('/newtest/', 'a67'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
