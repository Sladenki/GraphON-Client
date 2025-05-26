'use client'

import { useMemo, useState } from 'react';
import { LeftPanelProps } from './types';
import { THEME_CONFIG } from './constants';
import styles from './styles.module.scss';

export function LeftPanel({ 
  data, 
  onThemeSelect, 
  selectedTheme 
}: LeftPanelProps) {
  const root = useMemo(() => data.find(n => n.name === "КГТУ"), [data]);
  const themes = useMemo(() => 
    data.filter(n => n.parentGraphId?.$oid === root?._id.$oid),
    [data, root]
  );

  const subgraphs = useMemo(() => 
    selectedTheme ? data.filter(n => n.parentGraphId?.$oid === selectedTheme._id.$oid) : [],
    [data, selectedTheme]
  );

  const [hoveredThemeId, setHoveredThemeId] = useState<string | null>(null);

  const themeCount = useMemo(() => themes.length, [themes]);
  const subgraphCount = useMemo(() => subgraphs.length, [subgraphs]);

  if (!root || !themes.length) {
    return null;
  }

  return (
    <div className={styles.leftPanel}>
      <div className={styles.panelContent}>
        <h1 className={styles.title}>
          Планета – КГТУ
          <span className={styles.themeCount}>
            {themeCount} {themeCount === 1 ? 'спутник' : themeCount < 5 ? 'спутника' : 'спутников'}
          </span>
        </h1>
        
        <h2 className={styles.subtitle}>
          {selectedTheme ? (
            <>
              <span className={styles.emoji}>{THEME_CONFIG[selectedTheme.name] || '✨'}</span>
              {selectedTheme.name}
              <span className={styles.subgraphCount}>
                {subgraphCount} {subgraphCount === 1 ? 'подспутник' : subgraphCount < 5 ? 'подспутника' : 'подспутников'}
              </span>
            </>
          ) : (
            'Изученные спутники'
          )}
        </h2>
        
        {!selectedTheme ? (
          <div className={styles.themeBlocks}>
            {themes.map((theme) => (
              <div
                key={theme._id.$oid}
                    //    @ts-expect-error 123
                className={`${styles.themeBlock} ${selectedTheme?._id.$oid === theme._id.$oid ? styles.active : ''}`}
                onClick={() => onThemeSelect(theme)}
                onMouseEnter={() => setHoveredThemeId(theme._id.$oid)}
                onMouseLeave={() => setHoveredThemeId(null)}
              >
                <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
                <div className={styles.themeInfo}>
                  <span className={styles.themeName}>{theme.name}</span>
                  {theme.childGraphNum > 0 && (
                    <span className={styles.childCount}>
                      {theme.childGraphNum} {theme.childGraphNum === 1 ? 'подспутник' : theme.childGraphNum < 5 ? 'подспутника' : 'подспутников'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.subgraphBlocks}>
            <button 
              className={styles.backButton}
              onClick={() => onThemeSelect(null)}
              aria-label="Вернуться к темам"
            >
              Назад к темам
            </button>
            
            {subgraphs.length > 0 ? (
              subgraphs.map((subgraph) => (
                <div
                  key={subgraph._id.$oid}
                  className={styles.subgraphBlock}
                  onClick={() => {
                    console.log('Selected subgraph:', subgraph);
                  }}
                >
                  <div className={styles.subgraphInfo}>
                    <span className={styles.subgraphName}>{subgraph.name}</span>
                    {subgraph.directorName && (
                      <span className={styles.directorName}>
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
              ))
            ) : (
              <div className={styles.emptyState}>
                У этого спутника пока нет подспутников
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 