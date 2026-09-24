// Design Tokens strictly matching plan.txt
export const TOKENS = {
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sizes: {
      sm: '14px',   // Body, meta, badges, hints
      md: '16px',   // Subheadings, buttons, primary inputs
      lg: '24px',   // Main headings, scores, drawer titles
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radius: {
    sm: '8px',
    md: '12px',
    full: '9999px',
  },
  colors: {
    // Neutral base
    bg: '#f8fafc',
    surface: '#ffffff',
    surfaceSubtle: '#f1f5f9',
    border: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',

    // ONE Brand Color
    brand: '#0284c7', // River blue-teal
    brandHover: '#0369a1',
    brandSubtle: '#e0f2fe',

    // Semantic Status ONLY (never used decoratively)
    health: {
      excellent: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Excellent' },
      good: { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', label: 'Good' },
      moderate: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Moderate' },
      poor: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'Poor' },
      critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Critical' },
    },
    severity: {
      LOW: { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
      MEDIUM: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
      HIGH: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
      CRITICAL: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    }
  },
  shadows: {
    soft: '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
    floating: '0 10px 30px -4px rgba(15, 23, 42, 0.12)',
    drawer: '-8px 0 30px rgba(15, 23, 42, 0.15)',
  }
};
