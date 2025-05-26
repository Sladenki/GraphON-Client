'use client'

import { useMemo } from 'react';
import { LeftPanelProps, GraphNode } from './types';
import { THEME_CONFIG } from './constants';
import styles from './styles.module.scss';

export function ThemeCards({ 
  data, 
  onThemeSelect, 
  selectedTheme 
}: LeftPanelProps) {
  // Find root node first
  const rootNode = useMemo(() => {
    const found = data.find(n => n.name === "КГТУ");
    return found || null;
  }, [data]);

  // Filter themes only if we have a root node
  const themes = useMemo(() => {
    if (!rootNode) return [];
    return data.filter(n => n.parentGraphId?.$oid === rootNode._id.$oid);
  }, [data, rootNode]);

  // Filter subgraphs only if we have a selected theme
  const subgraphs = useMemo(() => {
    if (!selectedTheme) return [];
    return data.filter(n => n.parentGraphId?.$oid === selectedTheme._id.$oid);
  }, [data, selectedTheme]);

  if (!rootNode || !themes.length) {
    return null;
  }

  return (
    <div className={styles.themeCardsContainer}>
      {!selectedTheme ? (
        <div className={styles.themeCards}>
          {themes.map((theme) => (
            <button
              key={theme._id.$oid}
            //    @ts-expect-error 123
              className={`${styles.themeCard} ${selectedTheme?._id.$oid === theme._id.$oid ? styles.active : ''}`}
              onClick={() => onThemeSelect(theme)}
            >
              <div className={styles.cardContent}>
                <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
                <div className={styles.cardInfo}>
                  <span className={styles.cardTitle}>{theme.name}</span>
                  {theme.childGraphNum > 0 && (
                    <span className={styles.cardSubtitle}>
                      {theme.childGraphNum} {theme.childGraphNum === 1 ? 'подспутник' : theme.childGraphNum < 5 ? 'подспутника' : 'подспутников'}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.subgraphCards}>
          <button 
            className={styles.backButton}
            onClick={() => onThemeSelect(null)}
            aria-label="Вернуться к темам"
          >
            <span className={styles.backIcon}>←</span>
            Назад
          </button>
          
          <div className={styles.cardsWrapper}>
            {subgraphs.length > 0 ? (
              subgraphs.map((subgraph) => (
                <div
                  key={subgraph._id.$oid}
                  className={styles.subgraphCard}
                >
                  <div className={styles.cardContent}>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardTitle}>{subgraph.name}</span>
                      {subgraph.directorName && (
                        <span className={styles.cardSubtitle}>
                          {subgraph.directorName}
                        </span>
                      )}
                    </div>
                    {subgraph.vkLink && (
                      <a 
                        href={subgraph.vkLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.vkLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        VK
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                Нет подспутников
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 