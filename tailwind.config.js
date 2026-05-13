/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#6B3FA0',
          blue: '#1D4ED8',
          cyan: '#0EA5E9',
          pink: '#FF006E',
          orange: '#F97316',
          'cyan-bright': '#00D4FF',
          dark: '#091830',
          navy: '#112c52',
          'logo-navy': '#1B3172',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6B3FA0 0%, #1D4ED8 50%, #0EA5E9 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #F97316 0%, #FACC15 50%, #22C55E 100%)',
        'gradient-vibrant': 'linear-gradient(135deg, #6B3FA0 0%, #1D4ED8 40%, #00D4FF 100%)',
        'gradient-rainbow': 'linear-gradient(135deg, #F97316 0%, #FACC15 25%, #22C55E 50%, #0EA5E9 75%, #1D4ED8 100%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(107,63,160,0.45), 0 0 80px rgba(29,78,216,0.25)',
        'glow-pink': '0 0 40px rgba(255,0,110,0.4)',
        'glow-cyan': '0 0 40px rgba(0,212,255,0.4)',
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        card: '0 4px 24px rgba(0,0,0,0.3)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        'marquee-reverse': 'marqueeReverse 34s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(107,63,160,0.4)' },
          '50%': { boxShadow: '0 0 60px rgba(107,63,160,0.8)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-33.333%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-33.333%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
};
