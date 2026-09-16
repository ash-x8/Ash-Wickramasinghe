import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { dark: '#0B0F17', slate: '#1A1F2E', accent: '#3B82F6', cyan: '#06B6D4', purple: '#A855F7', glow: '#EC4899' }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
      boxShadow: { 'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)', 'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)', 'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)', elevated: '0 20px 40px rgba(0, 0, 0, 0.8)' },
      backgroundImage: { mesh: 'linear-gradient(45deg, rgba(59, 130, 246, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)' },
      keyframes: { shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } } },
      animation: { shimmer: 'shimmer 2s infinite' }
    }
  },
  plugins: []
};

export default config;
