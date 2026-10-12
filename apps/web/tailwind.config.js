/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand & Accent
        primary: {
          DEFAULT: '#246BFD',
          brand: '#0052D6',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          fixed: '#DBE1FF',
          'fixed-dim': '#B3C5FF',
        },
        secondary: {
          DEFAULT: '#0EA5E9',
          container: '#D0E1FB',
        },
        // Surface system
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          subtle: '#F1F5F9',
          highlight: '#EFF6FF',
          dim: '#D1DAF4',
          container: '#E9EDFF',
          'container-high': '#E1E8FF',
        },
        // Content
        content: {
          primary: '#172033',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        // Borders
        border: {
          hairline: '#E8EDF4',
          structural: '#E2E8F0',
          active: '#246BFD',
        },
        // Status
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#BA1A1A',
        'error-container': '#FFDAD6',
        // Palette accents (for style swatches)
        accent: {
          cream: '#EAE3D2',
          oak: '#A88B68',
          sage: '#7E9A82',
          slate: '#587B95',
          navy: '#222933',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      fontSize: {
        'headline-xl': ['32px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '700', letterSpacing: '-0.015em' }],
        'headline-md': ['18px', { lineHeight: '26px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'title-sm': ['15px', { lineHeight: '22px', fontWeight: '600' }],
        'body-lg': ['15px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'label-md': ['13px', { lineHeight: '18px', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'caption-xs': ['11px', { lineHeight: '14px', fontWeight: '600', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        sm: '0.25rem',    // 4px
        DEFAULT: '0.5rem', // 8px
        md: '0.625rem',   // 10px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
        '2xl': '1.5rem',  // 24px
      },
      spacing: {
        'gutter': '1.25rem',
        'xs': '0.25rem',
        'sm-space': '0.5rem',
        'md-space': '1rem',
        'lg-space': '1.5rem',
        'xl-space': '2rem',
        'panel-left': '360px',
        'panel-right': '380px',
      },
      boxShadow: {
        'level-1': '0 1px 3px rgba(23, 32, 51, 0.04), 0 1px 2px rgba(23, 32, 51, 0.02)',
        'level-2': '0 8px 24px -4px rgba(23, 32, 51, 0.08), 0 2px 6px -1px rgba(23, 32, 51, 0.04)',
        'level-3': '0 16px 36px -6px rgba(23, 32, 51, 0.12), 0 4px 12px -2px rgba(23, 32, 51, 0.06)',
        'focus-ring': '0 0 0 2px #FFFFFF, 0 0 0 4px #246BFD',
        'segment-active': '0 1px 3px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
