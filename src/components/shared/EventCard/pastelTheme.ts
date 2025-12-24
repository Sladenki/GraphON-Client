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

export function getPastelTheme(theme: ThemeName): PastelTheme {
  switch (theme) {
    case 'Бизнес':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-amber-600 text-white',
        buttonHover: 'hover:bg-amber-700',
        icon: 'text-amber-700',
        headerBgLight: 'linear-gradient(135deg, #f8fafc 0%, #fffbeb 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(245,158,11,0.16) 0%, rgba(251,191,36,0.06) 100%)',
      };
    case 'Вечеринки':
      return {
        chip: 'bg-fuchsia-100 text-fuchsia-700',
        button: 'bg-fuchsia-600 text-white',
        buttonHover: 'hover:bg-fuchsia-700',
        icon: 'text-fuchsia-700',
        headerBgLight: 'linear-gradient(135deg, #fdf4ff 0%, #faf5ff 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(217,70,239,0.18) 0%, rgba(168,85,247,0.07) 100%)',
      };
    case 'Встречи':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-700',
        headerBgLight: 'linear-gradient(135deg, #f0f9ff 0%, #eef2ff 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(56,189,248,0.16) 0%, rgba(99,102,241,0.07) 100%)',
      };
    case 'Гастро':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-700',
        headerBgLight: 'linear-gradient(135deg, #fffbeb 0%, #fff1f2 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(251,191,36,0.14) 0%, rgba(244,63,94,0.07) 100%)',
      };
    case 'Город':
      return {
        chip: 'bg-slate-100 text-slate-700',
        button: 'bg-slate-700 text-white',
        buttonHover: 'hover:bg-slate-800',
        icon: 'text-slate-700',
        headerBgLight: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(148,163,184,0.14) 0%, rgba(56,189,248,0.06) 100%)',
      };
    case 'Искусство':
      return {
        chip: 'bg-pink-100 text-pink-700',
        button: 'bg-pink-600 text-white',
        buttonHover: 'hover:bg-pink-700',
        icon: 'text-pink-700',
        headerBgLight: 'linear-gradient(135deg, #fdf2f8 0%, #fff7ed 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(236,72,153,0.16) 0%, rgba(249,115,22,0.06) 100%)',
      };
    case 'Кино':
      return {
        chip: 'bg-indigo-100 text-indigo-700',
        button: 'bg-indigo-600 text-white',
        buttonHover: 'hover:bg-indigo-700',
        icon: 'text-indigo-700',
        headerBgLight: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(99,102,241,0.16) 0%, rgba(148,163,184,0.06) 100%)',
      };
    case 'Музыка':
      return {
        chip: 'bg-violet-100 text-violet-700',
        button: 'bg-violet-600 text-white',
        buttonHover: 'hover:bg-violet-700',
        icon: 'text-violet-700',
        headerBgLight: 'linear-gradient(135deg, #f5f3ff 0%, #fff1f2 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(139,92,246,0.16) 0%, rgba(244,63,94,0.06) 100%)',
      };
    case 'Образование':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-700',
        headerBgLight: 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(56,189,248,0.14) 0%, rgba(16,185,129,0.07) 100%)',
      };
    case 'Семья':
      return {
        chip: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-700',
        headerBgLight: 'linear-gradient(135deg, #fff1f2 0%, #fffbeb 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(244,63,94,0.14) 0%, rgba(251,191,36,0.06) 100%)',
      };
    case 'Театр':
      return {
        chip: 'bg-purple-100 text-purple-700',
        button: 'bg-purple-600 text-white',
        buttonHover: 'hover:bg-purple-700',
        icon: 'text-purple-700',
        headerBgLight: 'linear-gradient(135deg, #faf5ff 0%, #fff1f2 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(168,85,247,0.16) 0%, rgba(244,63,94,0.06) 100%)',
      };
    case 'Фестивали, праздники':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-fuchsia-600 text-white',
        buttonHover: 'hover:bg-fuchsia-700',
        icon: 'text-fuchsia-700',
        headerBgLight: 'linear-gradient(135deg, #fffbeb 0%, #fdf4ff 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(217,70,239,0.07) 100%)',
      };
    case 'Юмор':
      return {
        chip: 'bg-yellow-100 text-yellow-800',
        button: 'bg-yellow-600 text-white',
        buttonHover: 'hover:bg-yellow-700',
        icon: 'text-yellow-700',
        headerBgLight: 'linear-gradient(135deg, #fefce8 0%, #f7fee7 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(250,204,21,0.14) 0%, rgba(132,204,22,0.07) 100%)',
      };
    case 'Волонтерство':
      return {
        chip: 'bg-emerald-100 text-emerald-700',
        button: 'bg-emerald-600 text-white',
        buttonHover: 'hover:bg-emerald-700',
        icon: 'text-emerald-600',
        headerBgLight: 'linear-gradient(135deg, #f7fee7 0%, #ecfdf5 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(132,204,22,0.14) 0%, rgba(16,185,129,0.08) 100%)',
      };
    case 'Медиа':
      return {
        chip: 'bg-violet-100 text-violet-700',
        button: 'bg-violet-600 text-white',
        buttonHover: 'hover:bg-violet-700',
        icon: 'text-violet-600',
        headerBgLight: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(139,92,246,0.16) 0%, rgba(59,130,246,0.07) 100%)',
      };
    case 'Наука':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-600',
        headerBgLight: 'linear-gradient(135deg, #f0f9ff 0%, #ecfeff 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(56,189,248,0.14) 0%, rgba(34,211,238,0.08) 100%)',
      };
    case 'Отряды':
      return {
        chip: 'bg-orange-100 text-orange-700',
        button: 'bg-orange-600 text-white',
        buttonHover: 'hover:bg-orange-700',
        icon: 'text-orange-600',
        headerBgLight: 'linear-gradient(135deg, #fff7ed 0%, #fff1f2 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(249,115,22,0.16) 0%, rgba(244,63,94,0.07) 100%)',
      };
    case 'Самоуправление':
      return {
        chip: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-600 text-white',
        buttonHover: 'hover:bg-blue-700',
        icon: 'text-blue-600',
        headerBgLight: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(37,99,235,0.14) 0%, rgba(148,163,184,0.06) 100%)',
      };
    case 'Спорт':
      return {
        chip: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-600',
        headerBgLight: 'linear-gradient(135deg, #f7fee7 0%, #fff1f2 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(132,204,22,0.14) 0%, rgba(244,63,94,0.07) 100%)',
      };
    case 'Творчество':
      return {
        chip: 'bg-pink-100 text-pink-700',
        button: 'bg-pink-600 text-white',
        buttonHover: 'hover:bg-pink-700',
        icon: 'text-pink-600',
        headerBgLight: 'linear-gradient(135deg, #fdf2f8 0%, #fdf4ff 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(236,72,153,0.16) 0%, rgba(217,70,239,0.08) 100%)',
      };
    default:
      return {
        chip: 'bg-slate-100 text-slate-700',
        button: 'bg-slate-700 text-white',
        buttonHover: 'hover:bg-slate-800',
        icon: 'text-slate-600',
        headerBgLight: 'linear-gradient(135deg, #f8fafc 0%, #fafafa 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(148,163,184,0.12) 0%, rgba(113,113,122,0.06) 100%)',
      };
  }
}


