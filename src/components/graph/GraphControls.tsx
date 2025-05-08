import { memo } from 'react';
import styles from './GraphControls.module.scss';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleMinimap: () => void;
  onToggleTheme: () => void;
  onGroupSelected: () => void;
  onUngroupSelected: () => void;
  onClearSelection: () => void;
  selectedCount: number;
  isMinimapVisible: boolean;
  isDarkTheme: boolean;
}

export const GraphControls = memo(({
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleMinimap,
  onToggleTheme,
  onGroupSelected,
  onUngroupSelected,
  onClearSelection,
  selectedCount,
  isMinimapVisible,
  isDarkTheme,
}: GraphControlsProps) => {
  return (
    <div className={styles.controls}>
      <div className={styles.zoomControls}>
        <button className={styles.controlButton} onClick={onZoomIn} title="Увеличить">
          <span className={styles.buttonIcon}>+</span>
        </button>
        <button className={styles.controlButton} onClick={onZoomOut} title="Уменьшить">
          <span className={styles.buttonIcon}>−</span>
        </button>
        <button className={styles.controlButton} onClick={onFitView} title="Показать всё">
          <span className={styles.buttonIcon}>⊞</span>
        </button>
      </div>

      <div className={styles.viewControls}>
        <button
          className={`${styles.controlButton} ${isMinimapVisible ? styles.active : ''}`}
          onClick={onToggleMinimap}
          title="Мини-карта"
        >
          <span className={styles.buttonIcon}>🗺</span>
        </button>
        <button
          className={`${styles.controlButton} ${isDarkTheme ? styles.active : ''}`}
          onClick={onToggleTheme}
          title="Сменить тему"
        >
          <span className={styles.buttonIcon}>🌓</span>
        </button>
      </div>

      {selectedCount > 0 && (
        <div className={styles.selectionControls}>
          <button className={styles.controlButton} onClick={onGroupSelected} title="Сгруппировать">
            <span className={styles.buttonIcon}>⊞</span>
          </button>
          <button className={styles.controlButton} onClick={onUngroupSelected} title="Разгруппировать">
            <span className={styles.buttonIcon}>⊟</span>
          </button>
          <button className={styles.controlButton} onClick={onClearSelection} title="Снять выделение">
            <span className={styles.buttonIcon}>✕</span>
          </button>
          <span className={styles.selectionCount}>
            Выбрано: {selectedCount}
          </span>
        </div>
      )}
    </div>
  );
}); 