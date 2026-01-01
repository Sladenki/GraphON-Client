export type ThemeName =
  | 'Бизнес'
  | 'Вечеринки'
  | 'Встречи'
  | 'Гастро'
  | 'Город'
  | 'Искусство'
  | 'Кино'
  | 'Музыка'
  | 'Образование'
  | 'Семья'
  | 'Театр'
  | 'Фестивали, праздники'
  | 'Юмор'
  | 'Волонтерство'
  | 'Медиа'
  | 'Наука'
  | 'Отряды'
  | 'Самоуправление'
  | 'Спорт'
  | 'Творчество'
  | 'Без тематики';

export type PastelTheme = {
  chip: string;
  button: string;
  buttonHover: string;
  icon: string;
  headerBgLight: string;
  headerBgDark: string;
};

export function getThemeName(event: any): ThemeName {
  // Важно: для city-мероприятий тематика лежит в event.parentGraphId
  const name =
    event?.type === 'city'
      ? (event?.parentGraphId?.name ?? null)
      : (event?.graphId?.parentGraphId?.name ?? event?.parentGraphId?.name ?? null);

  const normalized = typeof name === 'string' ? name.trim() : '';

  const allowed: ThemeName[] = [
    'Бизнес',
    'Вечеринки',
    'Встречи',
    'Гастро',
    'Город',
    'Искусство',
    'Кино',
    'Музыка',
    'Образование',
    'Семья',
    'Театр',
    'Фестивали, праздники',
    'Юмор',
    'Волонтерство',
    'Медиа',
    'Наука',
    'Отряды',
    'Самоуправление',
    'Спорт',
    'Творчество',
    'Без тематики',
  ];

  return allowed.includes(normalized as ThemeName) ? (normalized as ThemeName) : 'Без тематики';
}

// Premium multi-stop gradients for TikTok version - soft, modern, immersive
export function getPastelThemeTikTok(theme: ThemeName): PastelTheme {
  switch (theme) {
    case 'Бизнес':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-amber-600 text-white',
        buttonHover: 'hover:bg-amber-700',
        icon: 'text-amber-700',
        headerBgLight: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 35%, #fcd34d 70%, #fbbf24 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(251,191,36,0.40) 0%, rgba(245,158,11,0.35) 50%, rgba(251,191,36,0.30) 100%)',
      };
    case 'Вечеринки':
      return {
        chip: 'bg-fuchsia-100 text-fuchsia-700',
        button: 'bg-fuchsia-600 text-white',
        buttonHover: 'hover:bg-fuchsia-700',
        icon: 'text-fuchsia-700',
        headerBgLight: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 30%, #f5d0fe 60%, #e879f9 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(217,70,239,0.40) 0%, rgba(192,38,211,0.35) 50%, rgba(168,85,247,0.30) 100%)',
      };
    case 'Встречи':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-700',
        headerBgLight: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 35%, #93c5fd 70%, #818cf8 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(56,189,248,0.40) 0%, rgba(59,130,246,0.35) 50%, rgba(99,102,241,0.30) 100%)',
      };
    case 'Гастро':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-700',
        headerBgLight: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 30%, #fda4af 65%, #fb7185 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(251,191,36,0.38) 0%, rgba(249,115,22,0.32) 50%, rgba(244,63,94,0.30) 100%)',
      };
    case 'Город':
      return {
        chip: 'bg-slate-100 text-slate-700',
        button: 'bg-slate-700 text-white',
        buttonHover: 'hover:bg-slate-800',
        icon: 'text-slate-700',
        headerBgLight: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 35%, #94a3b8 70%, #7dd3fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(148,163,184,0.38) 0%, rgba(100,116,139,0.32) 50%, rgba(56,189,248,0.30) 100%)',
      };
    case 'Искусство':
      return {
        chip: 'bg-pink-100 text-pink-700',
        button: 'bg-pink-600 text-white',
        buttonHover: 'hover:bg-pink-700',
        icon: 'text-pink-700',
        headerBgLight: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 60%, #f9a8d4 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(236,72,153,0.40) 0%, rgba(244,63,94,0.35) 50%, rgba(249,115,22,0.30) 100%)',
      };
    case 'Кино':
      return {
        chip: 'bg-indigo-100 text-indigo-700',
        button: 'bg-indigo-600 text-white',
        buttonHover: 'hover:bg-indigo-700',
        icon: 'text-indigo-700',
        headerBgLight: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 35%, #c7d2fe 65%, #a5b4fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(99,102,241,0.40) 0%, rgba(79,70,229,0.35) 50%, rgba(148,163,184,0.30) 100%)',
      };
    case 'Музыка':
      return {
        chip: 'bg-violet-100 text-violet-700',
        button: 'bg-violet-600 text-white',
        buttonHover: 'hover:bg-violet-700',
        icon: 'text-violet-700',
        headerBgLight: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 30%, #ddd6fe 60%, #c084fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(139,92,246,0.40) 0%, rgba(168,85,247,0.35) 50%, rgba(244,63,94,0.30) 100%)',
      };
    case 'Образование':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-700',
        headerBgLight: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #a7f3d0 65%, #34d399 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(56,189,248,0.38) 0%, rgba(34,211,238,0.32) 50%, rgba(16,185,129,0.30) 100%)',
      };
    case 'Семья':
      return {
        chip: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-700',
        headerBgLight: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 30%, #fecdd3 60%, #fbbf24 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(244,63,94,0.38) 0%, rgba(251,113,133,0.32) 50%, rgba(251,191,36,0.30) 100%)',
      };
    case 'Театр':
      return {
        chip: 'bg-purple-100 text-purple-700',
        button: 'bg-purple-600 text-white',
        buttonHover: 'hover:bg-purple-700',
        icon: 'text-purple-700',
        headerBgLight: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 30%, #e9d5ff 60%, #c084fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(168,85,247,0.40) 0%, rgba(147,51,234,0.35) 50%, rgba(244,63,94,0.30) 100%)',
      };
    case 'Фестивали, праздники':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-fuchsia-600 text-white',
        buttonHover: 'hover:bg-fuchsia-700',
        icon: 'text-fuchsia-700',
        headerBgLight: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 30%, #fde68a 60%, #f0abfc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(251,191,36,0.35) 0%, rgba(245,158,11,0.30) 50%, rgba(217,70,239,0.30) 100%)',
      };
    case 'Юмор':
      return {
        chip: 'bg-yellow-100 text-yellow-800',
        button: 'bg-yellow-600 text-white',
        buttonHover: 'hover:bg-yellow-700',
        icon: 'text-yellow-700',
        headerBgLight: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 30%, #fde047 65%, #bef264 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(250,204,21,0.38) 0%, rgba(234,179,8,0.32) 50%, rgba(132,204,22,0.30) 100%)',
      };
    case 'Волонтерство':
      return {
        chip: 'bg-emerald-100 text-emerald-700',
        button: 'bg-emerald-600 text-white',
        buttonHover: 'hover:bg-emerald-700',
        icon: 'text-emerald-600',
        headerBgLight: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 35%, #a7f3d0 70%, #6ee7b7 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(16,185,129,0.38) 0%, rgba(5,150,105,0.32) 50%, rgba(34,197,94,0.30) 100%)',
      };
    case 'Медиа':
      return {
        chip: 'bg-violet-100 text-violet-700',
        button: 'bg-violet-600 text-white',
        buttonHover: 'hover:bg-violet-700',
        icon: 'text-violet-600',
        headerBgLight: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 30%, #ddd6fe 60%, #a78bfa 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(139,92,246,0.40) 0%, rgba(124,58,237,0.35) 50%, rgba(59,130,246,0.30) 100%)',
      };
    case 'Наука':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-600',
        headerBgLight: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #a5f3fc 65%, #67e8f9 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(56,189,248,0.38) 0%, rgba(14,165,233,0.32) 50%, rgba(34,211,238,0.30) 100%)',
      };
    case 'Отряды':
      return {
        chip: 'bg-orange-100 text-orange-700',
        button: 'bg-orange-600 text-white',
        buttonHover: 'hover:bg-orange-700',
        icon: 'text-orange-600',
        headerBgLight: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 30%, #fed7aa 60%, #fdba74 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(249,115,22,0.40) 0%, rgba(234,88,12,0.35) 50%, rgba(244,63,94,0.30) 100%)',
      };
    case 'Самоуправление':
      return {
        chip: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-600 text-white',
        buttonHover: 'hover:bg-blue-700',
        icon: 'text-blue-600',
        headerBgLight: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 35%, #bfdbfe 65%, #93c5fd 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(37,99,235,0.38) 0%, rgba(29,78,216,0.32) 50%, rgba(148,163,184,0.30) 100%)',
      };
    case 'Спорт':
      return {
        chip: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-600',
        headerBgLight: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 60%, #fda4af 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(16,185,129,0.38) 0%, rgba(34,197,94,0.32) 50%, rgba(244,63,94,0.30) 100%)',
      };
    case 'Творчество':
      return {
        chip: 'bg-pink-100 text-pink-700',
        button: 'bg-pink-600 text-white',
        buttonHover: 'hover:bg-pink-700',
        icon: 'text-pink-600',
        headerBgLight: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 60%, #f0abfc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(236,72,153,0.40) 0%, rgba(219,39,119,0.35) 50%, rgba(217,70,239,0.30) 100%)',
      };
    default:
      return {
        chip: 'bg-slate-100 text-slate-700',
        button: 'bg-slate-700 text-white',
        buttonHover: 'hover:bg-slate-800',
        icon: 'text-slate-600',
        headerBgLight: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 35%, #e2e8f0 70%, #cbd5e1 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(148,163,184,0.35) 0%, rgba(100,116,139,0.30) 50%, rgba(71,85,105,0.28) 100%)',
      };
  }
}

// Premium multi-stop gradients for standard version - softer, more subtle
export function getPastelTheme(theme: ThemeName): PastelTheme {
  switch (theme) {
    case 'Бизнес':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-amber-600 text-white',
        buttonHover: 'hover:bg-amber-700',
        icon: 'text-amber-700',
        headerBgLight: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #fde68a 80%, #fcd34d 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(245,158,11,0.20) 0%, rgba(251,191,36,0.12) 50%, rgba(245,158,11,0.08) 100%)',
      };
    case 'Вечеринки':
      return {
        chip: 'bg-fuchsia-100 text-fuchsia-700',
        button: 'bg-fuchsia-600 text-white',
        buttonHover: 'hover:bg-fuchsia-700',
        icon: 'text-fuchsia-700',
        headerBgLight: 'linear-gradient(135deg, #fdf4ff 0%, #faf5ff 40%, #f5e8ff 80%, #f0abfc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(217,70,239,0.22) 0%, rgba(192,38,211,0.14) 50%, rgba(168,85,247,0.10) 100%)',
      };
    case 'Встречи':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-700',
        headerBgLight: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #bae6fd 80%, #93c5fd 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(56,189,248,0.20) 0%, rgba(59,130,246,0.12) 50%, rgba(99,102,241,0.08) 100%)',
      };
    case 'Гастро':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-700',
        headerBgLight: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #fed7aa 70%, #fda4af 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(249,115,22,0.12) 50%, rgba(244,63,94,0.10) 100%)',
      };
    case 'Город':
      return {
        chip: 'bg-slate-100 text-slate-700',
        button: 'bg-slate-700 text-white',
        buttonHover: 'hover:bg-slate-800',
        icon: 'text-slate-700',
        headerBgLight: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 80%, #cbd5e1 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(148,163,184,0.18) 0%, rgba(100,116,139,0.12) 50%, rgba(56,189,248,0.08) 100%)',
      };
    case 'Искусство':
      return {
        chip: 'bg-pink-100 text-pink-700',
        button: 'bg-pink-600 text-white',
        buttonHover: 'hover:bg-pink-700',
        icon: 'text-pink-700',
        headerBgLight: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe8 80%, #f9a8d4 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(236,72,153,0.20) 0%, rgba(244,63,94,0.14) 50%, rgba(249,115,22,0.10) 100%)',
      };
    case 'Кино':
      return {
        chip: 'bg-indigo-100 text-indigo-700',
        button: 'bg-indigo-600 text-white',
        buttonHover: 'hover:bg-indigo-700',
        icon: 'text-indigo-700',
        headerBgLight: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 40%, #c7d2fe 80%, #a5b4fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(99,102,241,0.20) 0%, rgba(79,70,229,0.14) 50%, rgba(148,163,184,0.10) 100%)',
      };
    case 'Музыка':
      return {
        chip: 'bg-violet-100 text-violet-700',
        button: 'bg-violet-600 text-white',
        buttonHover: 'hover:bg-violet-700',
        icon: 'text-violet-700',
        headerBgLight: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #ddd6fe 80%, #c084fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(139,92,246,0.20) 0%, rgba(168,85,247,0.14) 50%, rgba(244,63,94,0.10) 100%)',
      };
    case 'Образование':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-700',
        headerBgLight: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 35%, #bae6fd 70%, #a7f3d0 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(56,189,248,0.18) 0%, rgba(34,211,238,0.12) 50%, rgba(16,185,129,0.10) 100%)',
      };
    case 'Семья':
      return {
        chip: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-700',
        headerBgLight: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 40%, #fecdd3 80%, #fde68a 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(244,63,94,0.18) 0%, rgba(251,113,133,0.12) 50%, rgba(251,191,36,0.10) 100%)',
      };
    case 'Театр':
      return {
        chip: 'bg-purple-100 text-purple-700',
        button: 'bg-purple-600 text-white',
        buttonHover: 'hover:bg-purple-700',
        icon: 'text-purple-700',
        headerBgLight: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 40%, #e9d5ff 80%, #c084fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(168,85,247,0.20) 0%, rgba(147,51,234,0.14) 50%, rgba(244,63,94,0.10) 100%)',
      };
    case 'Фестивали, праздники':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-fuchsia-600 text-white',
        buttonHover: 'hover:bg-fuchsia-700',
        icon: 'text-fuchsia-700',
        headerBgLight: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #fde68a 70%, #f0abfc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(251,191,36,0.16) 0%, rgba(245,158,11,0.12) 50%, rgba(217,70,239,0.10) 100%)',
      };
    case 'Юмор':
      return {
        chip: 'bg-yellow-100 text-yellow-800',
        button: 'bg-yellow-600 text-white',
        buttonHover: 'hover:bg-yellow-700',
        icon: 'text-yellow-700',
        headerBgLight: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 35%, #fde047 70%, #bef264 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(250,204,21,0.18) 0%, rgba(234,179,8,0.12) 50%, rgba(132,204,22,0.10) 100%)',
      };
    case 'Волонтерство':
      return {
        chip: 'bg-emerald-100 text-emerald-700',
        button: 'bg-emerald-600 text-white',
        buttonHover: 'hover:bg-emerald-700',
        icon: 'text-emerald-600',
        headerBgLight: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #a7f3d0 80%, #6ee7b7 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.12) 50%, rgba(34,197,94,0.10) 100%)',
      };
    case 'Медиа':
      return {
        chip: 'bg-violet-100 text-violet-700',
        button: 'bg-violet-600 text-white',
        buttonHover: 'hover:bg-violet-700',
        icon: 'text-violet-600',
        headerBgLight: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #ddd6fe 80%, #a78bfa 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(139,92,246,0.20) 0%, rgba(124,58,237,0.14) 50%, rgba(59,130,246,0.10) 100%)',
      };
    case 'Наука':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-600',
        headerBgLight: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 35%, #bae6fd 70%, #a5f3fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(56,189,248,0.18) 0%, rgba(14,165,233,0.12) 50%, rgba(34,211,238,0.10) 100%)',
      };
    case 'Отряды':
      return {
        chip: 'bg-orange-100 text-orange-700',
        button: 'bg-orange-600 text-white',
        buttonHover: 'hover:bg-orange-700',
        icon: 'text-orange-600',
        headerBgLight: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fed7aa 80%, #fdba74 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(249,115,22,0.20) 0%, rgba(234,88,12,0.14) 50%, rgba(244,63,94,0.10) 100%)',
      };
    case 'Самоуправление':
      return {
        chip: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-600 text-white',
        buttonHover: 'hover:bg-blue-700',
        icon: 'text-blue-600',
        headerBgLight: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 80%, #93c5fd 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(29,78,216,0.12) 50%, rgba(148,163,184,0.10) 100%)',
      };
    case 'Спорт':
      return {
        chip: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-600',
        headerBgLight: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 35%, #bbf7d0 70%, #fda4af 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(34,197,94,0.12) 50%, rgba(244,63,94,0.10) 100%)',
      };
    case 'Творчество':
      return {
        chip: 'bg-pink-100 text-pink-700',
        button: 'bg-pink-600 text-white',
        buttonHover: 'hover:bg-pink-700',
        icon: 'text-pink-600',
        headerBgLight: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe8 80%, #f0abfc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(236,72,153,0.20) 0%, rgba(219,39,119,0.14) 50%, rgba(217,70,239,0.10) 100%)',
      };
    default:
      return {
        chip: 'bg-slate-100 text-slate-700',
        button: 'bg-slate-700 text-white',
        buttonHover: 'hover:bg-slate-800',
        icon: 'text-slate-600',
        headerBgLight: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 80%, #cbd5e1 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(148,163,184,0.16) 0%, rgba(100,116,139,0.12) 50%, rgba(71,85,105,0.10) 100%)',
      };
  }
}

