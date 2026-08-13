/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],

  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },

        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },

        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        lime: {
          400: '#BFFF00',
          500: '#B6FF00',
          600: '#8FCC00',
          700: '#6FA000',
        },

        dark: {
          900: '#030303',
          800: '#070707',
          700: '#0B0B0B',
          600: '#111111',
        },
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      backgroundImage: {
        'gradient-radial':
          'radial-gradient(var(--tw-gradient-stops))',

        // Black + lime instead of purple/pink
        'hero-gradient':
          'linear-gradient(135deg, #030303 0%, #080D03 55%, #111A00 100%)',

        'lime-gradient':
          'linear-gradient(135deg, #B6FF00 0%, #8FCC00 100%)',

        'glass-gradient':
          'linear-gradient(135deg, rgba(182,255,0,0.08) 0%, rgba(255,255,255,0.03) 100%)',
      },

      boxShadow: {
        'lime-glow':
          '0 0 30px rgba(182, 255, 0, 0.18)',

        'lime-glow-lg':
          '0 0 60px rgba(182, 255, 0, 0.25)',
      },

      animation: {
        'pulse-slow':
          'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',

        scan: 'scan 2s ease-in-out infinite',

        'float-slow':
          'float 5s ease-in-out infinite',
      },

      keyframes: {
        scan: {
          '0%, 100%': {
            transform: 'translateY(0)',
            opacity: '0.5',
          },
          '50%': {
            transform: 'translateY(100%)',
            opacity: '1',
          },
        },

        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-8px)',
          },
        },
      },
    },
  },

  plugins: [
    require('tailwindcss-animate'),
  ],
};