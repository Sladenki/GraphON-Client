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
        headerBgDark: 'linear-gradient(135deg, rgba(180,140,50,0.25) 0%, rgba(160,120,40,0.22) 50%, rgba(180,140,50,0.20) 100%)',
      };
    case 'Вечеринки':
      return {
        chip: 'bg-fuchsia-100 text-fuchsia-700',
        button: 'bg-fuchsia-600 text-white',
        buttonHover: 'hover:bg-fuchsia-700',
        icon: 'text-fuchsia-700',
        headerBgLight: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 30%, #f5d0fe 60%, #e879f9 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(160,80,180,0.25) 0%, rgba(140,70,160,0.22) 50%, rgba(130,90,200,0.20) 100%)',
      };
    case 'Встречи':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-700',
        headerBgLight: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 35%, #93c5fd 70%, #818cf8 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(70,150,200,0.25) 0%, rgba(80,120,200,0.22) 50%, rgba(90,100,210,0.20) 100%)',
      };
    case 'Гастро':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-700',
        headerBgLight: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 30%, #fda4af 65%, #fb7185 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(180,140,50,0.23) 0%, rgba(200,100,60,0.20) 50%, rgba(200,80,100,0.18) 100%)',
      };
    case 'Город':
      return {
        chip: 'bg-slate-100 text-slate-700',
        button: 'bg-slate-700 text-white',
        buttonHover: 'hover:bg-slate-800',
        icon: 'text-slate-700',
        headerBgLight: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 35%, #94a3b8 70%, #7dd3fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(120,135,150,0.23) 0%, rgba(100,115,130,0.20) 50%, rgba(70,150,200,0.18) 100%)',
      };
    case 'Искусство':
      return {
        chip: 'bg-pink-100 text-pink-700',
        button: 'bg-pink-600 text-white',
        buttonHover: 'hover:bg-pink-700',
        icon: 'text-pink-700',
        headerBgLight: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 60%, #f9a8d4 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(190,100,150,0.25) 0%, rgba(200,90,120,0.22) 50%, rgba(200,110,80,0.20) 100%)',
      };
    case 'Кино':
      return {
        chip: 'bg-indigo-100 text-indigo-700',
        button: 'bg-indigo-600 text-white',
        buttonHover: 'hover:bg-indigo-700',
        icon: 'text-indigo-700',
        headerBgLight: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 35%, #c7d2fe 65%, #a5b4fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(100,100,200,0.25) 0%, rgba(90,85,190,0.22) 50%, rgba(120,135,150,0.20) 100%)',
      };
    case 'Музыка':
      return {
        chip: 'bg-violet-100 text-violet-700',
        button: 'bg-violet-600 text-white',
        buttonHover: 'hover:bg-violet-700',
        icon: 'text-violet-700',
        headerBgLight: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 30%, #ddd6fe 60%, #c084fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(130,100,210,0.25) 0%, rgba(150,95,210,0.22) 50%, rgba(200,90,120,0.20) 100%)',
      };
    case 'Образование':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-700',
        headerBgLight: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #a7f3d0 65%, #34d399 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(70,150,200,0.23) 0%, rgba(60,170,200,0.20) 50%, rgba(50,150,120,0.18) 100%)',
      };
    case 'Семья':
      return {
        chip: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-700',
        headerBgLight: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 30%, #fecdd3 60%, #fbbf24 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(200,80,120,0.23) 0%, rgba(210,110,130,0.20) 50%, rgba(180,140,50,0.18) 100%)',
      };
    case 'Театр':
      return {
        chip: 'bg-purple-100 text-purple-700',
        button: 'bg-purple-600 text-white',
        buttonHover: 'hover:bg-purple-700',
        icon: 'text-purple-700',
        headerBgLight: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 30%, #e9d5ff 60%, #c084fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(150,95,210,0.25) 0%, rgba(140,70,200,0.22) 50%, rgba(200,90,120,0.20) 100%)',
      };
    case 'Фестивали, праздники':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-fuchsia-600 text-white',
        buttonHover: 'hover:bg-fuchsia-700',
        icon: 'text-fuchsia-700',
        headerBgLight: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 30%, #fde68a 60%, #f0abfc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(180,140,50,0.22) 0%, rgba(160,120,40,0.20) 50%, rgba(160,80,180,0.18) 100%)',
      };
    case 'Юмор':
      return {
        chip: 'bg-yellow-100 text-yellow-800',
        button: 'bg-yellow-600 text-white',
        buttonHover: 'hover:bg-yellow-700',
        icon: 'text-yellow-700',
        headerBgLight: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 30%, #fde047 65%, #bef264 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(200,160,60,0.23) 0%, rgba(200,150,50,0.20) 50%, rgba(120,180,70,0.18) 100%)',
      };
    case 'Волонтерство':
      return {
        chip: 'bg-emerald-100 text-emerald-700',
        button: 'bg-emerald-600 text-white',
        buttonHover: 'hover:bg-emerald-700',
        icon: 'text-emerald-600',
        headerBgLight: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 35%, #a7f3d0 70%, #6ee7b7 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(50,150,120,0.23) 0%, rgba(40,130,100,0.20) 50%, rgba(60,170,110,0.18) 100%)',
      };
    case 'Медиа':
      return {
        chip: 'bg-violet-100 text-violet-700',
        button: 'bg-violet-600 text-white',
        buttonHover: 'hover:bg-violet-700',
        icon: 'text-violet-600',
        headerBgLight: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 30%, #ddd6fe 60%, #a78bfa 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(130,100,210,0.25) 0%, rgba(120,85,200,0.22) 50%, rgba(80,120,200,0.20) 100%)',
      };
    case 'Наука':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-600',
        headerBgLight: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #a5f3fc 65%, #67e8f9 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(70,150,200,0.23) 0%, rgba(50,140,190,0.20) 50%, rgba(60,170,200,0.18) 100%)',
      };
    case 'Отряды':
      return {
        chip: 'bg-orange-100 text-orange-700',
        button: 'bg-orange-600 text-white',
        buttonHover: 'hover:bg-orange-700',
        icon: 'text-orange-600',
        headerBgLight: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 30%, #fed7aa 60%, #fdba74 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(200,100,60,0.25) 0%, rgba(190,85,50,0.22) 50%, rgba(200,80,100,0.20) 100%)',
      };
    case 'Самоуправление':
      return {
        chip: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-600 text-white',
        buttonHover: 'hover:bg-blue-700',
        icon: 'text-blue-600',
        headerBgLight: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 35%, #bfdbfe 65%, #93c5fd 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(70,110,200,0.23) 0%, rgba(60,95,190,0.20) 50%, rgba(120,135,150,0.18) 100%)',
      };
    case 'Спорт':
      return {
        chip: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-600',
        headerBgLight: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 60%, #fda4af 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(50,150,120,0.23) 0%, rgba(60,170,110,0.20) 50%, rgba(200,80,100,0.18) 100%)',
      };
    case 'Творчество':
      return {
        chip: 'bg-pink-100 text-pink-700',
        button: 'bg-pink-600 text-white',
        buttonHover: 'hover:bg-pink-700',
        icon: 'text-pink-600',
        headerBgLight: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 60%, #f0abfc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(190,100,150,0.25) 0%, rgba(180,70,130,0.22) 50%, rgba(160,80,180,0.20) 100%)',
      };
    default:
      return {
        chip: 'bg-slate-100 text-slate-700',
        button: 'bg-slate-700 text-white',
        buttonHover: 'hover:bg-slate-800',
        icon: 'text-slate-600',
        headerBgLight: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 35%, #e2e8f0 70%, #cbd5e1 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(120,135,150,0.22) 0%, rgba(100,115,130,0.18) 50%, rgba(85,95,110,0.16) 100%)',
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
        headerBgDark: 'linear-gradient(135deg, rgba(160,120,40,0.14) 0%, rgba(180,140,50,0.10) 50%, rgba(160,120,40,0.08) 100%)',
      };
    case 'Вечеринки':
      return {
        chip: 'bg-fuchsia-100 text-fuchsia-700',
        button: 'bg-fuchsia-600 text-white',
        buttonHover: 'hover:bg-fuchsia-700',
        icon: 'text-fuchsia-700',
        headerBgLight: 'linear-gradient(135deg, #fdf4ff 0%, #faf5ff 40%, #f5e8ff 80%, #f0abfc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(160,80,180,0.14) 0%, rgba(140,70,160,0.10) 50%, rgba(130,90,200,0.08) 100%)',
      };
    case 'Встречи':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-700',
        headerBgLight: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #bae6fd 80%, #93c5fd 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(70,150,200,0.14) 0%, rgba(80,120,200,0.10) 50%, rgba(90,100,210,0.08) 100%)',
      };
    case 'Гастро':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-700',
        headerBgLight: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #fed7aa 70%, #fda4af 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(180,140,50,0.12) 0%, rgba(200,100,60,0.10) 50%, rgba(200,80,100,0.08) 100%)',
      };
    case 'Город':
      return {
        chip: 'bg-slate-100 text-slate-700',
        button: 'bg-slate-700 text-white',
        buttonHover: 'hover:bg-slate-800',
        icon: 'text-slate-700',
        headerBgLight: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 80%, #cbd5e1 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(120,135,150,0.12) 0%, rgba(100,115,130,0.10) 50%, rgba(70,150,200,0.08) 100%)',
      };
    case 'Искусство':
      return {
        chip: 'bg-pink-100 text-pink-700',
        button: 'bg-pink-600 text-white',
        buttonHover: 'hover:bg-pink-700',
        icon: 'text-pink-700',
        headerBgLight: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe8 80%, #f9a8d4 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(190,100,150,0.14) 0%, rgba(200,90,120,0.10) 50%, rgba(200,110,80,0.08) 100%)',
      };
    case 'Кино':
      return {
        chip: 'bg-indigo-100 text-indigo-700',
        button: 'bg-indigo-600 text-white',
        buttonHover: 'hover:bg-indigo-700',
        icon: 'text-indigo-700',
        headerBgLight: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 40%, #c7d2fe 80%, #a5b4fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(100,100,200,0.14) 0%, rgba(90,85,190,0.10) 50%, rgba(120,135,150,0.08) 100%)',
      };
    case 'Музыка':
      return {
        chip: 'bg-violet-100 text-violet-700',
        button: 'bg-violet-600 text-white',
        buttonHover: 'hover:bg-violet-700',
        icon: 'text-violet-700',
        headerBgLight: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #ddd6fe 80%, #c084fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(130,100,210,0.14) 0%, rgba(150,95,210,0.10) 50%, rgba(200,90,120,0.08) 100%)',
      };
    case 'Образование':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-700',
        headerBgLight: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 35%, #bae6fd 70%, #a7f3d0 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(70,150,200,0.12) 0%, rgba(60,170,200,0.10) 50%, rgba(50,150,120,0.08) 100%)',
      };
    case 'Семья':
      return {
        chip: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-700',
        headerBgLight: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 40%, #fecdd3 80%, #fde68a 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(200,80,120,0.12) 0%, rgba(210,110,130,0.10) 50%, rgba(180,140,50,0.08) 100%)',
      };
    case 'Театр':
      return {
        chip: 'bg-purple-100 text-purple-700',
        button: 'bg-purple-600 text-white',
        buttonHover: 'hover:bg-purple-700',
        icon: 'text-purple-700',
        headerBgLight: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 40%, #e9d5ff 80%, #c084fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(150,95,210,0.14) 0%, rgba(140,70,200,0.10) 50%, rgba(200,90,120,0.08) 100%)',
      };
    case 'Фестивали, праздники':
      return {
        chip: 'bg-amber-100 text-amber-800',
        button: 'bg-fuchsia-600 text-white',
        buttonHover: 'hover:bg-fuchsia-700',
        icon: 'text-fuchsia-700',
        headerBgLight: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #fde68a 70%, #f0abfc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(180,140,50,0.11) 0%, rgba(160,120,40,0.10) 50%, rgba(160,80,180,0.08) 100%)',
      };
    case 'Юмор':
      return {
        chip: 'bg-yellow-100 text-yellow-800',
        button: 'bg-yellow-600 text-white',
        buttonHover: 'hover:bg-yellow-700',
        icon: 'text-yellow-700',
        headerBgLight: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 35%, #fde047 70%, #bef264 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(200,160,60,0.12) 0%, rgba(200,150,50,0.10) 50%, rgba(120,180,70,0.08) 100%)',
      };
    case 'Волонтерство':
      return {
        chip: 'bg-emerald-100 text-emerald-700',
        button: 'bg-emerald-600 text-white',
        buttonHover: 'hover:bg-emerald-700',
        icon: 'text-emerald-600',
        headerBgLight: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #a7f3d0 80%, #6ee7b7 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(50,150,120,0.12) 0%, rgba(40,130,100,0.10) 50%, rgba(60,170,110,0.08) 100%)',
      };
    case 'Медиа':
      return {
        chip: 'bg-violet-100 text-violet-700',
        button: 'bg-violet-600 text-white',
        buttonHover: 'hover:bg-violet-700',
        icon: 'text-violet-600',
        headerBgLight: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #ddd6fe 80%, #a78bfa 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(130,100,210,0.14) 0%, rgba(120,85,200,0.10) 50%, rgba(80,120,200,0.08) 100%)',
      };
    case 'Наука':
      return {
        chip: 'bg-sky-100 text-sky-700',
        button: 'bg-sky-600 text-white',
        buttonHover: 'hover:bg-sky-700',
        icon: 'text-sky-600',
        headerBgLight: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 35%, #bae6fd 70%, #a5f3fc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(70,150,200,0.12) 0%, rgba(50,140,190,0.10) 50%, rgba(60,170,200,0.08) 100%)',
      };
    case 'Отряды':
      return {
        chip: 'bg-orange-100 text-orange-700',
        button: 'bg-orange-600 text-white',
        buttonHover: 'hover:bg-orange-700',
        icon: 'text-orange-600',
        headerBgLight: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fed7aa 80%, #fdba74 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(200,100,60,0.14) 0%, rgba(190,85,50,0.10) 50%, rgba(200,80,100,0.08) 100%)',
      };
    case 'Самоуправление':
      return {
        chip: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-600 text-white',
        buttonHover: 'hover:bg-blue-700',
        icon: 'text-blue-600',
        headerBgLight: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 80%, #93c5fd 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(70,110,200,0.12) 0%, rgba(60,95,190,0.10) 50%, rgba(120,135,150,0.08) 100%)',
      };
    case 'Спорт':
      return {
        chip: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 text-white',
        buttonHover: 'hover:bg-rose-700',
        icon: 'text-rose-600',
        headerBgLight: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 35%, #bbf7d0 70%, #fda4af 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(50,150,120,0.12) 0%, rgba(60,170,110,0.10) 50%, rgba(200,80,100,0.08) 100%)',
      };
    case 'Творчество':
      return {
        chip: 'bg-pink-100 text-pink-700',
        button: 'bg-pink-600 text-white',
        buttonHover: 'hover:bg-pink-700',
        icon: 'text-pink-600',
        headerBgLight: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe8 80%, #f0abfc 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(190,100,150,0.14) 0%, rgba(180,70,130,0.10) 50%, rgba(160,80,180,0.08) 100%)',
      };
    default:
      return {
        chip: 'bg-slate-100 text-slate-700',
        button: 'bg-slate-700 text-white',
        buttonHover: 'hover:bg-slate-800',
        icon: 'text-slate-600',
        headerBgLight: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 80%, #cbd5e1 100%)',
        headerBgDark: 'linear-gradient(135deg, rgba(120,135,150,0.11) 0%, rgba(100,115,130,0.09) 50%, rgba(85,95,110,0.08) 100%)',
      };
  }
}

