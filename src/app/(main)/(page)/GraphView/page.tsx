import React from 'react';
import GraphView from './GraphView';
import styles from './page.module.scss';

export default function GraphViewPage() {
  return (
    <div className={styles.container}>
      <GraphView searchQuery="" />
    </div>
  );
} 