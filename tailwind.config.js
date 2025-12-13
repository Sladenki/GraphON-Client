// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // обязательно для поддержки темной темы
  theme: {
    extend: {
      colors: {
        glass: {
          primary: 'rgba(255, 255, 255, 0.1)',
          secondary: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.2)',
          dark: {
            primary: 'rgba(17, 24, 39, 0.4)',
            secondary: 'rgba(31, 41, 55, 0.2)',
            border: 'rgba(75, 85, 99, 0.3)',
          }
        },
        neon: {
          purple: '#8b5cf6',
          blue: '#3b82f6',
          pink: '#ec4899',
        }
      },
      gradients: {
        primary: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
        secondary: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
        danger: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'neon': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon-lg': '0 0 40px rgba(139, 92, 246, 0.7)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { 
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        slideInRight: {
          '0%': { 
            transform: 'translateX(100%)',
            opacity: '0',
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.6)',
          },
        },
      },
      fontFamily: {
        'orbitron': ['var(--font-orbitron)', 'Orbitron', 'Space Grotesk', 'Trebuchet MS', 'sans-serif'],
        'inter': ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-effect': {
          'backdrop-filter': 'blur(20px)',
          'background': 'rgba(255, 255, 255, 0.1)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-effect-dark': {
          'backdrop-filter': 'blur(20px)',
          'background': 'rgba(17, 24, 39, 0.4)',
          'border': '1px solid rgba(75, 85, 99, 0.3)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.gradient-border': {
          'background': 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, transparent 50%, rgba(59, 130, 246, 0.2) 100%)',
          'padding': '1px',
          'border-radius': '1rem',
        },
        '.gradient-border::before': {
          'content': '""',
          'position': 'absolute',
          'inset': '1px',
          'background': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)',
          'border-radius': 'inherit',
          'backdrop-filter': 'blur(30px)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};
