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
        <div className={styles.themeScroll}>
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
        <div className={styles.subgraphWrapper}>
          <button className={styles.backButton} onClick={() => onThemeSelect(null)}>Назад</button>
          <div className={styles.subgraphList}>
            {subgraphs.length ? subgraphs.map(sub => (
              <div key={sub._id.$oid} className={styles.subgraphCard} onClick={() => onSubgraphSelect(sub)}>
                <div>
                  <span className={styles.cardTitle}>{sub.name}</span>
                  {sub.directorName && <span className={styles.cardSubtitle}>{sub.directorName}</span>}
                </div>
                {sub.vkLink && (
                  <a
                    href={sub.vkLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.vkLink}
                    onClick={(e) => e.stopPropagation()}
                  >VK</a>
                )}
              </div>
            )) : <div className={styles.emptyState}>Нет подспутников</div>}
          </div>
        </div>
      )}
    </div>
  );
};
