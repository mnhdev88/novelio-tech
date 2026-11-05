// Every colour here is sampled from public/logo.png. The utility hues below are
// remapped (not just added) because service/industry gradients are stored as
// Tailwind classes in content/*.json and edited from the admin panel: remapping
// keeps those on-brand without changing the content schema.
const logo = {
  ink: '#0D246A',
  red: '#E02A2A',
  orange: '#F07030',
  amber: '#F0A030',
  yellow: '#F0D030',
  green: '#0A924E',
  teal: '#129880',
  sky: '#1391C4',
  blue: '#1376B4',
  indigo: '#42499D',
  violet: '#5E328C',
};

/** @type {import('tailwindcss').Config} */
export default {
  // content/*.json is scanned because it holds gradient class names.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './content/**/*.json'],
  theme: {
    extend: {
      colors: {
        logo,
        brand: {
          purple: logo.violet,
          blue: logo.blue,
          cyan: logo.sky,
          pink: logo.red,
          orange: logo.orange,
          'cyan-bright': logo.sky,
          dark: '#081648',
          navy: logo.ink,
          'logo-navy': logo.ink,
        },
        paper: { DEFAULT: '#FBFAF6', deep: '#F3F2EC' },
        red: { 500: logo.red, 600: logo.red },
        rose: { 500: logo.red, 600: logo.red },
        pink: { 500: logo.red, 600: logo.red },
        fuchsia: { 500: logo.violet, 600: logo.violet },
        orange: { 500: logo.orange },
        amber: { 400: logo.amber, 500: logo.orange },
        yellow: { 400: logo.yellow, 500: logo.yellow },
        lime: { 500: logo.green },
        green: { 500: logo.green, 600: '#0A8547' },
        emerald: { 500: logo.green, 600: '#0A8547' },
        teal: { 500: logo.teal, 600: logo.teal },
        cyan: { 500: logo.sky, 600: logo.sky },
        sky: { 500: logo.sky, 600: logo.blue },
        blue: { 500: logo.sky, 600: logo.blue, 700: logo.blue },
        indigo: { 500: logo.indigo, 600: logo.indigo, 700: logo.indigo },
        violet: { 500: logo.violet, 600: logo.violet },
        purple: { 500: logo.violet, 600: logo.violet },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      // Numeric font-weight utilities (font-400 … font-800) are used throughout
      // the codebase. Tailwind doesn't ship these by default, so they must be
      // declared here or the classes silently emit no CSS.
      fontWeight: {
        400: '400',
        500: '500',
        600: '600',
        700: '700',
        800: '800',
      },
      backgroundImage: {
        spectrum: 'linear-gradient(90deg, #E02A2A 0%, #F07030 16%, #F0D030 34%, #0A924E 52%, #129880 64%, #1376B4 78%, #42499D 90%, #5E328C 100%)',
        'gradient-primary': 'linear-gradient(135deg, #5E328C 0%, #42499D 50%, #1376B4 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #E02A2A 0%, #F07030 50%, #F0D030 100%)',
        'gradient-vibrant': 'linear-gradient(135deg, #5E328C 0%, #1376B4 60%, #129880 100%)',
        'gradient-rainbow': 'linear-gradient(135deg, #E02A2A 0%, #F07030 20%, #F0D030 40%, #0A924E 60%, #1391C4 80%, #1376B4 100%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(94,50,140,0.45), 0 0 80px rgba(19,118,180,0.25)',
        'glow-pink': '0 0 40px rgba(224,42,42,0.4)',
        'glow-cyan': '0 0 40px rgba(19,145,196,0.4)',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(94,50,140,0.4)' },
          '50%': { boxShadow: '0 0 60px rgba(94,50,140,0.8)' },
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
