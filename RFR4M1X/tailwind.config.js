/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        heading: ['Syne', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        ink: '#0a0a0a',
        surface: '#f5f5f5',
        muted: '#737373',
        line: '#e5e5e5',
        graphite: '#111111',
      },
      boxShadow: {
        soft: '0 18px 50px -34px rgba(10, 10, 10, 0.35)',
        glass: '0 18px 50px -40px rgba(10, 10, 10, 0.45)',
      },
      backgroundImage: {
        'hero-grid':
          'linear-gradient(135deg, rgba(10,10,10,0.96), rgba(35,35,35,0.82))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
