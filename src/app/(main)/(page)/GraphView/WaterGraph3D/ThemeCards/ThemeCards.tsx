'use client';

import { useMemo } from 'react';
import { ThemeCardsProps } from '../types';
import { THEME_CONFIG } from '../constants';
import styles from './ThemeCards.module.scss';

export const ThemeCards = ({ data, onThemeSelect, selectedTheme, onSubgraphSelect }: ThemeCardsProps) => {
  const rootNode = useMemo(() => data.find(n => n.name === 'КГТУ') || null, [data]);
  const themes = useMemo(() => rootNode ? data.filter(n => n.parentGraphId?.$oid === rootNode._id.$oid) : [], [data, rootNode]);
  const subgraphs = useMemo(() => selectedTheme ? data.filter(n => n.parentGraphId?.$oid === selectedTheme._id.$oid) : [], [data, selectedTheme]);

  if (!rootNode || !themes.length) return null;

  return (
    <div className={styles.themeOverlay}>
      {!selectedTheme ? (
        <div className={styles.themeScroll} data-scrollable="true">
          {themes.map(theme => (
            <button
              key={theme._id.$oid}
              className={styles.themeCard}
              onClick={() => onThemeSelect(theme)}
            >
              <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
              <span className={styles.cardTitle}>{theme.name}</span>
              {theme.childGraphNum > 0 && (
                <span className={styles.cardSubtitle}>
                  {theme.childGraphNum} {theme.childGraphNum === 1 ? 'подспутник' : theme.childGraphNum < 5 ? 'подспутника' : 'подспутников'}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.subgraphContent}>
          <button className={styles.backButton} onClick={() => onThemeSelect(null)}>← Назад</button>
         {subgraphs.length ? (
          <div className={styles.subgraphContent} data-scrollable="true">
            {subgraphs.map(sub => (
              <div key={sub._id.$oid} className={styles.subgraphCard} onClick={() => onSubgraphSelect(sub)}>
                <div className={styles.cardContent}>
                  <span className={styles.cardTitle} title={sub.name}>{sub.name}</span>
                  {sub.directorName && <span className={styles.cardSubtitle} title={sub.directorName}>{sub.directorName}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>Нет подспутников</div>
        )}
        </div>
      )}
    </div>
  );
};
