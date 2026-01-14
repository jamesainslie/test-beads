/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base colors
        border: 'hsl(var(--border))',
        'border-muted': 'hsl(var(--border-muted))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Surface colors - layered elevation
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          raised: 'hsl(var(--surface-raised))',
          overlay: 'hsl(var(--surface-overlay))',
          inset: 'hsl(var(--surface-inset))',
        },

        // Primary colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },

        // Secondary colors
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },

        // Destructive colors
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        // Muted colors
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        // Accent colors
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        // Popover colors
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        // Card colors
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Text semantic colors
        text: {
          DEFAULT: 'hsl(var(--text))',
          muted: 'hsl(var(--text-muted))',
          subtle: 'hsl(var(--text-subtle))',
        },

        // Status colors - for issue states
        status: {
          open: {
            DEFAULT: 'hsl(var(--status-open))',
            foreground: 'hsl(var(--status-open-foreground))',
            muted: 'hsl(var(--status-open-muted))',
          },
          'in-progress': {
            DEFAULT: 'hsl(var(--status-in-progress))',
            foreground: 'hsl(var(--status-in-progress-foreground))',
            muted: 'hsl(var(--status-in-progress-muted))',
          },
          blocked: {
            DEFAULT: 'hsl(var(--status-blocked))',
            foreground: 'hsl(var(--status-blocked-foreground))',
            muted: 'hsl(var(--status-blocked-muted))',
          },
          closed: {
            DEFAULT: 'hsl(var(--status-closed))',
            foreground: 'hsl(var(--status-closed-foreground))',
            muted: 'hsl(var(--status-closed-muted))',
          },
        },

        // Priority colors
        priority: {
          critical: 'hsl(var(--priority-critical))',
          high: 'hsl(var(--priority-high))',
          medium: 'hsl(var(--priority-medium))',
          low: 'hsl(var(--priority-low))',
          backlog: 'hsl(var(--priority-backlog))',
        },

        // Sidebar colors
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          muted: 'hsl(var(--sidebar-muted))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
