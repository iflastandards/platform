import { type ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Entity-Based Cataloging',
    icon: '🏗️',
    description: (
      <>
        ISBDM implements the IFLA Library Reference Model (LRM) for
        manifestations, providing a modern foundation for describing
        bibliographic resources in an interconnected, semantic web-ready format.
      </>
    ),
  },
  {
    title: 'Smart Navigation',
    icon: '🧭',
    description: (
      <>
        Every element is just two clicks away. Navigate through hierarchical
        relationships, cross-references, and semantic connections with an
        intuitive interface designed for cataloging professionals.
      </>
    ),
  },
  {
    title: 'Living Documentation',
    icon: '📚',
    description: (
      <>
        Unlike static PDFs, ISBDM evolves with your needs. Updates are instant,
        examples are interactive, and the entire standard adapts to how you use
        it - with collapsible sections and smart search.
      </>
    ),
  },
];

function Feature({ title, icon, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureIcon}>{icon}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--xl">
          What Makes ISBDM Different
        </Heading>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
