'use client';

import React, { useMemo, useState } from 'react';
import styles from './StaffPage.module.scss';
import { Bell, Settings, Users, Gauge, Sparkles } from 'lucide-react';
import SearchBar from '@/components/shared/SearchBar/SearchBar';
import ActionButton from '@/components/ui/ActionButton/ActionButton';

type TabKey = 'overview' | 'people' | 'tasks';

const MOCK_ROWS = [
  { id: '1', title: 'Business Analytics', sub: '37/40 Places • By John Paul', status: 'Active' },
  { id: '2', title: 'Motion Design', sub: '12 lessons • 28 min', status: 'Today' },
  { id: '3', title: 'Chemistry', sub: '10:00 • Room 302', status: 'Next' },
] as const;

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [chip, setChip] = useState<'All' | 'Design' | 'Dev' | 'Science'>('All');
  const [q, setQ] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  const progress = 0.78;
  const progressPct = Math.round(progress * 100);

  const filteredRows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return MOCK_ROWS;
    return MOCK_ROWS.filter((r) => r.title.toLowerCase().includes(query) || r.sub.toLowerCase().includes(query));
  }, [q]);

  return (
    <div className={styles.page}>
      {/* AppTopBar (design-system showcase) */}
      <div className={styles.topBar}>
        <div className={styles.greeting}>
          <div className={styles.avatar} aria-hidden="true">
            S
          </div>
          <div className={styles.helloBlock}>
            <div className={styles.hello}>Hello, Staff</div>
            <div className={styles.subHello}>Mock Dashboard • Design System</div>
          </div>
        </div>
        <div className={styles.iconButtons}>
          <button className={styles.iconBtn} type="button" aria-label="Notifications" onClick={() => setSheetOpen(true)}>
            <Bell size={18} />
          </button>
          <button className={styles.iconBtn} type="button" aria-label="Settings" onClick={() => setSheetOpen(true)}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* StatsCard */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Stats Cards</div>
        <div className={styles.statsGrid}>
          <div className={`${styles.statsCard} ${styles.mint}`}>
            <div className={styles.statsIcon} aria-hidden="true">
              <Users size={18} />
            </div>
            <div>
              <div className={styles.statsNumber}>5</div>
              <div className={styles.statsLabel}>Certificates</div>
            </div>
          </div>
          <div className={`${styles.statsCard} ${styles.peach}`}>
            <div className={styles.statsIcon} aria-hidden="true">
              <Sparkles size={18} />
            </div>
            <div>
              <div className={styles.statsNumber}>12</div>
              <div className={styles.statsLabel}>Courses</div>
            </div>
          </div>
          <div className={`${styles.statsCard} ${styles.lavender}`}>
            <div className={styles.statsIcon} aria-hidden="true">
              <Gauge size={18} />
            </div>
            <div>
              <div className={styles.statsNumber}>78%</div>
              <div className={styles.statsLabel}>Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* SearchInput */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Search Input</div>
        <SearchBar
          placeholder="Search..."
          onSearch={setQ}
          onTagFilter={() => {}}
          showTagFilter={false}
        />
      </div>

      {/* PillTabs */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Pill Tabs</div>
        <div className={styles.tabsRail} role="tablist" aria-label="Staff tabs">
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabActive : ''}`}
            type="button"
            onClick={() => setActiveTab('overview')}
            role="tab"
            aria-selected={activeTab === 'overview'}
          >
            Overview
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'people' ? styles.tabActive : ''}`}
            type="button"
            onClick={() => setActiveTab('people')}
            role="tab"
            aria-selected={activeTab === 'people'}
          >
            People <span className={styles.tabBadge}>3</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'tasks' ? styles.tabActive : ''}`}
            type="button"
            onClick={() => setActiveTab('tasks')}
            role="tab"
            aria-selected={activeTab === 'tasks'}
          >
            Tasks <span className={styles.tabBadge}>7</span>
          </button>
        </div>
      </div>

      {/* Chips */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Chips</div>
        <div className={styles.chips}>
          {(['All', 'Design', 'Dev', 'Science'] as const).map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.chip} ${chip === c ? styles.chipActive : ''}`}
              onClick={() => setChip(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ProgressBar */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Progress Bar</div>
        <div className={styles.progressRow}>
          <div className={styles.progressLabel}>Progress</div>
          <div className={styles.progressPct}>{progressPct}%</div>
        </div>
        <div className={styles.progressTrack} aria-label="Progress track">
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* ListRow + Buttons */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>List Rows + Buttons</div>
        <div className={styles.list}>
          {filteredRows.map((r) => (
            <div key={r.id} className={styles.row}>
              <div className={styles.rowLeft}>
                <div className={styles.rowAvatar} aria-hidden="true">
                  {r.title.slice(0, 1)}
                </div>
                <div className={styles.rowMain}>
                  <div className={styles.rowTopLine}>
                    <div className={styles.rowTitle}>{r.title}</div>
                    <span className={styles.statusPill}>{r.status}</span>
                  </div>
                  <div className={styles.rowSub}>{r.sub}</div>
                </div>
              </div>
              <div className={styles.actions}>
                <ActionButton label="View" variant="info" className={styles.noLift} onClick={() => setSheetOpen(true)} />
                <ActionButton label="Primary" variant="primary" className={styles.noLift} onClick={() => setSheetOpen(true)} />
                <ActionButton label="Danger" variant="danger" className={styles.noLift} onClick={() => setSheetOpen(true)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ModalSheet */}
      {sheetOpen ? (
        <div className={styles.sheetOverlay} role="dialog" aria-modal="true" onClick={() => setSheetOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <div className={styles.sheetTitle}>Modal Sheet</div>
              <button className={styles.iconBtn} type="button" aria-label="Close" onClick={() => setSheetOpen(false)}>
                ✕
              </button>
            </div>
            <div className={styles.sheetBody}>
              This is a minimal sheet: rounded surface, soft overlay, no borders/shadows. Use it for quick actions,
              confirmations, and contextual menus.
            </div>
            <div className={styles.sheetActions}>
              <ActionButton label="Cancel" variant="info" className={styles.noLift} onClick={() => setSheetOpen(false)} />
              <ActionButton label="Done" variant="primary" className={styles.noLift} onClick={() => setSheetOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


