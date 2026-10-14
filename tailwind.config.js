/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0B132B',
          850: '#111B38',
          800: '#1C2541',
          700: '#27345A',
          600: '#3A4B75',
        },
        civic: {
          teal: '#0D9488',
          'teal-light': '#14B8A6',
          'teal-cyan': '#2DD4BF',
          'teal-dark': '#0F766E',
          slate: '#64748B',
          'slate-light': '#94A3B8',
          'slate-dark': '#334155',
          amber: '#F59E0B',
          'amber-light': '#FBBF24',
          red: '#EF4444',
          'red-dark': '#DC2626',
          green: '#10B981',
          'green-dark': '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.3)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'navy-gradient': 'linear-gradient(180deg, #0B132B 0%, #060B18 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      }
    },
  },
  plugins: [],
}
