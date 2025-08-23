import { type JSX } from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './Hero.module.css';

export default function Hero(): JSX.Element {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className={styles.heroTitle}>
            IFLA Standards Portal
          </Heading>
          <p className={styles.heroSubtitle}>
            Access authoritative bibliographic standards developed by the
            International Federation of Library Associations and Institutions
          </p>

          <div className={styles.heroActions}>
            <Link className="button button--primary button--lg" to="#standards">
              Explore Standards
            </Link>
            <Link className="button button--secondary button--lg" to="/docs">
              Documentation
            </Link>
          </div>

          <div className={styles.heroDescription}>
            <Heading as="h2">Professional Bibliographic Standards</Heading>
            <p>
              IFLA develops and maintains international standards that enable
              libraries worldwide to:
            </p>
            <ul>
              <li>Create consistent and interoperable bibliographic records</li>
              <li>Share resources effectively across institutions</li>
              <li>Implement modern cataloging practices</li>
              <li>Support discovery and access to library materials</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
