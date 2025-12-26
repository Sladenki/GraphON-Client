'use client';

import React, { useMemo, useState } from 'react';
import {
  Bell,
  Settings,
  Search,
  ChevronDown,
  CheckCircle2,
  Users,
  Sparkles,
  Gauge,
  Clock,
  MapPin,
  Heart,
  Star,
  PlayCircle,
  BadgeCheck,
  CalendarDays,
} from 'lucide-react';
import styles from './StaffThree.module.scss';

type TabKey = 'overview' | 'people' | 'tasks';
type ChipKey = 'All' | 'Design' | 'Dev' | 'Science';
type DropdownOption = { id: string; label: string };
type UserCard = { id: string; name: string; role: string; status: 'online' | 'busy' | 'offline' };
type GroupCard = { id: string; name: string; members: number; course: string; progress: number };
type TaskRow = { id: string; title: string; meta: string; track: ChipKey | string; duration: string };
type CourseCard = { id: string; title: string; meta: string; chip: string; tone: 'peach' | 'mint' | 'lavender' };

const STATS = [
  { id: 'certs', label: 'Certificates', value: '5', tone: 'mint', icon: <CheckCircle2 size={18} /> },
  { id: 'courses', label: 'Courses', value: '12', tone: 'peach', icon: <Sparkles size={18} /> },
  { id: 'progress', label: 'Progress', value: '78%', tone: 'lavender', icon: <Gauge size={18} /> },
] as const;

const DROPDOWN_OPTIONS: DropdownOption[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];

const USERS: UserCard[] = [
  { id: 'u1', name: 'Ava Nolan', role: 'Design Lead', status: 'online' },
  { id: 'u2', name: 'Liam West', role: 'Frontend', status: 'offline' },
  { id: 'u3', name: 'Mia Chen', role: 'Data', status: 'busy' },
];

const GROUPS: GroupCard[] = [
  { id: 'g1', name: 'Product Sprint', members: 8, course: 'UI/UX', progress: 68 },
  { id: 'g2', name: 'Math Circle', members: 12, course: 'Algebra II', progress: 52 },
];

const TASKS: TaskRow[] = [
  { id: 't1', title: 'Prepare slides', meta: 'Design • Today', track: 'Design', duration: '25m' },
  { id: 't2', title: 'Code review', meta: 'Dev • In 1h', track: 'Dev', duration: '30m' },
  { id: 't3', title: 'Labs setup', meta: 'Science • Tomorrow', track: 'Science', duration: '20m' },
];

const COURSES: CourseCard[] = [
  { id: 'c1', title: 'Product research', meta: '3 resources', chip: 'Design', tone: 'peach' },
  { id: 'c2', title: 'Frontend basics', meta: '2 labs', chip: 'Dev', tone: 'mint' },
  { id: 'c3', title: 'Chemistry notes', meta: '5 cards', chip: 'Science', tone: 'lavender' },
];

export default function StaffThree() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [chip, setChip] = useState<ChipKey>('All');
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DropdownOption>(DROPDOWN_OPTIONS[0]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TASKS.filter((task) => {
      const matchesChip = chip === 'All' || task.track.toLowerCase() === chip.toLowerCase();
      const matchesQuery = !q || task.title.toLowerCase().includes(q) || task.meta.toLowerCase().includes(q);
      return matchesChip && matchesQuery;
    });
  }, [chip, query]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topBar}>
          <div className={styles.greeting}>
            <div className={styles.avatar} aria-hidden="true">
              S
            </div>
            <div className={styles.helloBlock}>
              <div className={styles.hello}>Hello, StaffThree</div>
              <div className={styles.subHello}>Pastel dashboard kit · #9682EE</div>
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
            <div className={styles.progressTrack} aria-label="Progress bar">
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
          <div className={styles.heroBadges} role="list" aria-label="Quick chips">
            {['Design', 'Dev', 'Science'].map((label) => (
              <span key={label} className={styles.heroChip} role="listitem">
                <BadgeCheck size={14} />
                {label}
              </span>
            ))}
            <button className={styles.heroGhost} type="button" onClick={() => setSheetOpen(true)}>
              <Heart size={16} />
              Save preset
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Buttons</div>
          <div className={styles.buttonRow}>
            <button type="button" className={`${styles.btn} ${styles.primaryBtn}`}>
              Primary
            </button>
            <button type="button" className={`${styles.btn} ${styles.secondaryBtn}`}>
              Secondary
            </button>
            <button type="button" className={`${styles.btn} ${styles.ghostBtn}`}>
              Ghost
            </button>
            <button type="button" className={`${styles.btn} ${styles.dangerBtn}`}>
              Danger
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>Pill tabs</div>
          <div className={styles.tabsRail} role="tablist" aria-label="Dashboard tabs">
            {(['overview', 'people', 'tasks'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'people' && 'People'}
                {tab === 'tasks' && 'Tasks'}
              </button>
            ))}
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
          <div className={styles.sectionLabel}>Search + dropdown</div>
          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sessions..."
              className={styles.searchInput}
              aria-label="Search"
            />
            <CalendarDays size={18} className={styles.searchTrailing} aria-hidden="true" />
          </div>
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
            {dropdownOpen ? (
              <div className={styles.dropdownMenu} role="listbox">
                {DROPDOWN_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={selectedRange.id === opt.id}
                    className={`${styles.dropdownItem} ${selectedRange.id === opt.id ? styles.dropdownItemActive : ''}`}
                    onClick={() => {
                      setSelectedRange(opt);
                      setDropdownOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Cards</div>
            <span className={styles.sectionMeta}>Pastel blocks with pill badges</span>
          </div>
          <div className={styles.cardGrid}>
            {COURSES.map((course) => (
              <div key={course.id} className={`${styles.card} ${styles[course.tone]}`}>
                <div className={styles.cardBadge}>{course.chip}</div>
                <div className={styles.cardTitle}>{course.title}</div>
                <div className={styles.cardMeta}>{course.meta}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Stats + progress</div>
            <span className={styles.sectionMeta}>Tinted fills, no heavy shadows</span>
          </div>
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
          <div className={styles.progressRow}>
            <div className={styles.progressText}>
              <div className={styles.progressTitle}>Weekly goal</div>
              <div className={styles.progressSub}>Design • Dev • Science</div>
            </div>
            <div className={styles.progressChip}>78%</div>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: '78%' }} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>List rows</div>
          <div className={styles.list}>
            {filteredTasks.map((task) => (
              <div key={task.id} className={styles.row}>
                <div className={styles.rowLeft}>
                  <div className={styles.rowAvatar}>{task.title.slice(0, 1)}</div>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTopLine}>
                      <div className={styles.rowTitle}>{task.title}</div>
                      <span className={styles.statusPill}>{task.track}</span>
                    </div>
                    <div className={styles.rowSub}>{task.meta}</div>
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <button type="button" className={styles.rowActionGhost} aria-label="Open">
                    <PlayCircle size={18} />
                  </button>
                  <button type="button" className={styles.rowActionSolid}>
                    {task.duration}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>User & group cards</div>
          <div className={styles.userGrid}>
            {USERS.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userAvatar}>{user.name.slice(0, 1)}</div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userRole}>{user.role}</div>
                </div>
                <span className={`${styles.userStatus} ${styles[user.status]}`}>{user.status}</span>
              </div>
            ))}
          </div>
          <div className={styles.groupGrid}>
            {GROUPS.map((group) => (
              <div key={group.id} className={styles.groupCard}>
                <div className={styles.groupHead}>
                  <div className={styles.groupBadge}>{group.course}</div>
                  <div className={styles.groupMembers}>{group.members} members</div>
                </div>
                <div className={styles.groupTitle}>{group.name}</div>
                <div className={styles.groupProgressRow}>
                  <div className={styles.groupProgressTrack}>
                    <div className={styles.groupProgressFill} style={{ width: `${group.progress}%` }} />
                  </div>
                  <div className={styles.groupProgressPct}>{group.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Modal sheet</div>
            <span className={styles.sectionMeta}>Soft overlay, pill buttons</span>
          </div>
          <div className={styles.buttonRow}>
            <button type="button" className={`${styles.btn} ${styles.primaryBtn}`} onClick={() => setSheetOpen(true)}>
              Open sheet
            </button>
          </div>
        </section>
      </div>

      {sheetOpen ? (
        <div className={styles.sheetOverlay} role="dialog" aria-modal="true" onClick={() => setSheetOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <div className={styles.sheetTitle}>Pastel sheet</div>
              <button className={styles.iconBtn} type="button" aria-label="Close" onClick={() => setSheetOpen(false)}>
                ✕
              </button>
            </div>
            <div className={styles.sheetBody}>
              Minimal modal surface that uses pastel overlay and pill actions. Keep interactions calm and touch-first.
            </div>
            <div className={styles.sheetActions}>
              <button type="button" className={`${styles.btn} ${styles.secondaryBtn}`} onClick={() => setSheetOpen(false)}>
                Cancel
              </button>
              <button type="button" className={`${styles.btn} ${styles.primaryBtn}`} onClick={() => setSheetOpen(false)}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


