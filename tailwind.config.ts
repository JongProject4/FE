// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A90D9',
          light: '#EBF4FF',
          mid: '#B8D9F5',
          dark: '#2E6FB5',
        },
        medical: {
          green: '#52B788',
          'green-light': '#EAFBF1',
        },
        app: {
          bg: '#F5F8FF',
          surface: '#FFFFFF',
          text: '#1A2340',
          secondary: '#6B7A99',
          muted: '#A0AABF',
          border: 'rgba(74, 144, 217, 0.15)',
        },
      },
      borderRadius: {
        '4xl': '28px',
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease both',
        'fade-in': 'fadeIn 0.25s ease both',
        'bounce-dot': 'bounceDot 1.2s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        bounceDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        },
      },
      screens: {
        xs: '375px',
        sm: '430px',
      },
    },
  },
  plugins: [],
}

export default config
