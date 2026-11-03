/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        filipiniana: {
          base: 'var(--color-bg-base, #FAF7F2)',
          card: 'var(--color-bg-card, #FFFDFB)',
          charcoal: 'var(--color-text-main, #231F20)',
          clay: 'var(--color-text-muted, #6D4C41)',
          crimson: 'var(--color-primary, #C62828)',
          crimsonHover: 'var(--color-primary-hover, #B71C1C)',
          gold: 'var(--color-secondary, #F57F17)',
          terracotta: 'var(--color-accent-terracotta, #D84315)',
          emerald: 'var(--color-nature-emerald, #2E7D32)',
          azure: 'var(--color-water-azure, #00838F)',
          rattan: 'var(--color-border-ethnic, #8D6E63)',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Rozha One"', 'Georgia', 'serif'],
        woodcut: ['"Rozha One"', '"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        linocut: '4px 4px 0px #231F20',
        'linocut-sm': '2px 2px 0px #231F20',
        'linocut-lg': '6px 6px 0px #231F20',
        'linocut-gold': '4px 4px 0px #F57F17',
        'linocut-crimson': '4px 4px 0px #C62828',
        'linocut-emerald': '4px 4px 0px #2E7D32',
      },
      keyframes: {
        tiniklingSnap: {
          '0%': { transform: 'scale(1) translateY(0)' },
          '40%': { transform: 'scale(0.96, 0.94) translateY(3px)' },
          '75%': { transform: 'scale(1.03, 1.02) translateY(-1px)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
        jeepneyRideIn: {
          '0%': { opacity: '0', transform: 'translateY(28px) scale(0.92) rotate(-1deg)' },
          '65%': { opacity: '1', transform: 'translateY(-6px) scale(1.02) rotate(0.5deg)' },
          '85%': { transform: 'translateY(2px) scale(0.995) rotate(0deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1) rotate(0deg)' },
        },
        jeepneyIdling: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-3px) rotate(-1.5deg)' },
          '50%': { transform: 'translateY(-1px) rotate(1deg)' },
          '75%': { transform: 'translateY(-4px) rotate(-0.8deg)' },
        },
      },
      animation: {
        'tinikling-snap': 'tiniklingSnap 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'jeepney-ride': 'jeepneyRideIn 0.42s cubic-bezier(0.22, 1.35, 0.36, 1) forwards',
        'jeepney-idle': 'jeepneyIdling 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
