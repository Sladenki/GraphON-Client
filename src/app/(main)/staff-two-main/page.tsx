'use client';

import React, { useMemo, useState } from 'react';
import {
  Bell,
  Settings,
  Target,
  BookOpen,
  CheckCircle2,
  Clock,
  MapPin,
  CalendarDays,
  PlayCircle,
  Heart,
  Search,
  ChevronDown,
} from 'lucide-react';
import styles from './StaffTwoMain.module.scss';

type TabKey = 'overview' | 'schedule' | 'tasks';
type ChipKey = 'All' | 'Design' | 'Dev' | 'Science';
type DropdownOption = { id: string; label: string };

const STATS = [
  { id: 'certs', label: 'Certificates', value: '5', tone: 'mint', icon: <CheckCircle2 size={18} /> },
  { id: 'courses', label: 'Courses', value: '12', tone: 'peach', icon: <BookOpen size={18} /> },
  { id: 'progress', label: 'Progress', value: '78%', tone: 'lavender', icon: <Target size={18} /> },
] as const;

const DATE_PILLS = [
  { id: 'mon', label: 'M', day: '14' },
  { id: 'tue', label: 'T', day: '15' },
  { id: 'wed', label: 'W', day: '16' },
  { id: 'thu', label: 'T', day: '17' },
  { id: 'fri', label: 'F', day: '18' },
];

const SCHEDULE = [
  { id: '1', time: '08:00', title: 'Writing', meta: 'with Kate • Room 103', track: 'Design', duration: '25 min', day: 'mon' },
  { id: '2', time: '10:00', title: 'Math', meta: 'Room 202', track: 'Science', duration: '30 min', day: 'mon' },
  { id: '3', time: '12:00', title: 'Developing', meta: 'Lab 3 • Sprint prep', track: 'Dev', duration: '15 min', day: 'mon' },
  { id: '4', time: '09:00', title: 'Chemistry', meta: 'Room 305', track: 'Science', duration: '30 min', day: 'tue' },
] as const;

const QUIZ_TAGS = ['Geographic', 'Chemistry', 'Math', 'Writing', 'Developing'] as const;

const DROPDOWN_OPTIONS: DropdownOption[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];

export default function StaffTwoMain() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [chip, setChip] = useState<ChipKey>('All');
  const [search, setSearch] = useState('');
  const [activeDate, setActiveDate] = useState<string>('mon');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DropdownOption>(DROPDOWN_OPTIONS[0]);

  const filteredSchedule = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SCHEDULE.filter((item) => {
      const matchesChip = chip === 'All' || item.track.toLowerCase().includes(chip.toLowerCase());
      const matchesDate = item.day === activeDate;
      const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.meta.toLowerCase().includes(q);
      return matchesChip && matchesDate && matchesSearch;
    });
  }, [activeDate, chip, search]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topBar}>
          <div className={styles.greeting}>
            <div className={styles.avatar} aria-hidden="true">
              L
            </div>
            <div>
              <div className={styles.hello}>Hello Len</div>
              <div className={styles.subHello}>Pastel dashboard kit · Violet</div>
            </div>
          </div>
          <div className={styles.iconButtons}>
            <button className={styles.iconBtn} type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className={styles.iconBtn} type="button" aria-label="Settings">
              <Settings size={18} />
            </button>
          </div>
        </header>

        <section className={styles.heroCard} aria-label="Today highlight">
          <div className={styles.heroLeft}>
            <div className={styles.heroLabel}>Learnings today</div>
            <div className={styles.heroValue}>
              58% <span>/ 28min</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: '58%' }} />
            </div>
            <div className={styles.heroMetaRow}>
              <div className={styles.metaItem}>
                <Clock size={14} />
                <span>Focus 25m</span>
              </div>
              <div className={styles.metaItem}>
                <MapPin size={14} />
                <span>Room 103</span>
              </div>
            </div>
          </div>
          <div className={styles.heroDates} role="listbox" aria-label="Pick a day">
            {DATE_PILLS.map((d) => (
              <button
                key={d.id}
                type="button"
                role="option"
                aria-selected={activeDate === d.id}
                className={`${styles.datePill} ${activeDate === d.id ? styles.dateActive : ''}`}
                onClick={() => setActiveDate(d.id)}
              >
                <span className={styles.dateLabel}>{d.label}</span>
                <span className={styles.dateNumber}>{d.day}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Stats summary</div>
          <div className={styles.statsGrid}>
            {STATS.map((stat) => (
              <div key={stat.id} className={`${styles.statsCard} ${styles[stat.tone]}`}>
                <div className={styles.statsIcon} aria-hidden="true">
                  {stat.icon}
                </div>
                <div>
                  <div className={styles.statsNumber}>{stat.value}</div>
                  <div className={styles.statsLabel}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Search + filters</div>
          <div className={styles.search}>
            <Search size={16} className={styles.searchIcon} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className={styles.searchInput}
              aria-label="Search"
            />
            <CalendarDays size={18} className={styles.searchTrailing} />
          </div>
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
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Pill tabs</div>
          <div className={styles.tabsRail} role="tablist" aria-label="Dashboard tabs">
            {(['overview', 'schedule', 'tasks'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'schedule' && 'Schedule'}
                {tab === 'tasks' && 'Tasks'}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Progress</div>
          <div className={styles.progressRow}>
            <div className={styles.progressText}>
              <div className={styles.progressTitle}>Weekly goal</div>
              <div className={styles.progressSub}>Geography · Writing · Math</div>
            </div>
            <div className={styles.progressChip}>78%</div>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: '78%' }} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Dropdown</div>
            <div className={styles.dropdownWrapper}>
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${dropdownOpen ? styles.dropdownOpen : ''}`}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((v) => !v)}
              >
                {selectedRange.label}
                <ChevronDown size={16} />
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu} role="listbox">
                  {DROPDOWN_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="option"
                      aria-selected={selectedRange.id === opt.id}
                      className={`${styles.dropdownItem} ${
                        selectedRange.id === opt.id ? styles.dropdownItemActive : ''
                      }`}
                      onClick={() => {
                        setSelectedRange(opt);
                        setDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Schedule rows</div>
          <div className={styles.list}>
            {filteredSchedule.map((item) => (
              <div key={item.id} className={styles.row}>
                <div className={styles.rowTime}>
                  <Clock size={14} />
                  <span>{item.time}</span>
                </div>
                <div className={styles.rowMain}>
                  <div className={styles.rowTitleLine}>
                    <div className={styles.rowTitle}>{item.title}</div>
                    <span className={styles.statusPill}>{item.track}</span>
                  </div>
                  <div className={styles.rowMeta}>{item.meta}</div>
                </div>
                <div className={styles.rowActions}>
                  <button type="button" className={styles.rowActionGhost} aria-label="Play">
                    <PlayCircle size={18} />
                  </button>
                  <button type="button" className={styles.rowActionSolid}>
                    {item.duration}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Quiz card</div>
          <div className={styles.quizCard}>
            <div className={styles.quizHeader}>
              <div className={styles.quizProgress}>
                <span>6:21</span>
                <div className={styles.quizDots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className={styles.quizPct}>78%</div>
            </div>
            <div className={styles.quizHero}>
              <div className={styles.mascot} aria-hidden="true">
                <Heart size={24} />
              </div>
              <div className={styles.quizChips}>
                {QUIZ_TAGS.map((tag) => (
                  <span key={tag} className={styles.quizChip}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.quizQuestion}>Name a country that shares a border with Germany?</div>
            <input className={styles.answerInput} placeholder="Type your answer..." />
            <div className={styles.quizActions}>
              <button type="button" className={styles.secondaryBtn}>
                Back
              </button>
              <button type="button" className={styles.primaryBtn}>
                Next
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Buttons</div>
          <div className={styles.buttonRow}>
            <button type="button" className={styles.primaryBtn}>
              Primary
            </button>
            <button type="button" className={styles.secondaryBtn}>
              Secondary
            </button>
            <button type="button" className={styles.ghostBtn}>
              Ghost
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

