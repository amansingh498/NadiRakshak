import React from 'react';
import { TOKENS } from '../../tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  style,
  ...props
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  let bg = TOKENS.colors.brand;
  let color = '#ffffff';
  let border = 'none';

  if (isSecondary) {
    bg = TOKENS.colors.surface;
    color = TOKENS.colors.textPrimary;
    border = `1px solid ${TOKENS.colors.border}`;
  } else if (variant === 'ghost') {
    bg = 'transparent';
    color = TOKENS.colors.textSecondary;
  } else if (isDanger) {
    bg = TOKENS.colors.health.critical.color;
    color = '#ffffff';
  }

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: TOKENS.spacing.sm,
        padding: size === 'sm' ? '6px 12px' : '10px 18px',
        fontSize: size === 'sm' ? TOKENS.typography.sizes.sm : TOKENS.typography.sizes.md,
        fontWeight: TOKENS.typography.weights.semibold,
        fontFamily: TOKENS.typography.fontFamily,
        borderRadius: TOKENS.radius.md,
        backgroundColor: bg,
        color: color,
        border: border,
        cursor: 'pointer',
        boxShadow: isPrimary ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
        transition: 'all 0.15s ease',
        outline: 'none',
        ...style,
      }}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'health' | 'severity' | 'neutral' | 'brand';
  score?: number;
  level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', score, level }) => {
  let color = TOKENS.colors.textSecondary;
  let bg = TOKENS.colors.surfaceSubtle;
  let border = TOKENS.colors.border;

  if (variant === 'health' && score !== undefined) {
    if (score >= 80) { color = TOKENS.colors.health.excellent.color; bg = TOKENS.colors.health.excellent.bg; border = TOKENS.colors.health.excellent.border; }
    else if (score >= 60) { color = TOKENS.colors.health.good.color; bg = TOKENS.colors.health.good.bg; border = TOKENS.colors.health.good.border; }
    else if (score >= 40) { color = TOKENS.colors.health.moderate.color; bg = TOKENS.colors.health.moderate.bg; border = TOKENS.colors.health.moderate.border; }
    else if (score >= 20) { color = TOKENS.colors.health.poor.color; bg = TOKENS.colors.health.poor.bg; border = TOKENS.colors.health.poor.border; }
    else { color = TOKENS.colors.health.critical.color; bg = TOKENS.colors.health.critical.bg; border = TOKENS.colors.health.critical.border; }
  } else if (variant === 'severity' && level) {
    const sev = TOKENS.colors.severity[level];
    color = sev.color; bg = sev.bg; border = sev.border;
  } else if (variant === 'brand') {
    color = TOKENS.colors.brand; bg = TOKENS.colors.brandSubtle; border = 'transparent';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: TOKENS.radius.full,
        fontSize: TOKENS.typography.sizes.sm,
        fontWeight: TOKENS.typography.weights.semibold,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1.2,
      }}
    >
      {children}
    </span>
  );
};

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-panel">
        <div style={{ padding: TOKENS.spacing.lg, borderBottom: `1px solid ${TOKENS.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: TOKENS.typography.sizes.lg, fontWeight: TOKENS.typography.weights.bold, color: TOKENS.colors.textPrimary }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: TOKENS.typography.sizes.sm, color: TOKENS.colors.textSecondary, marginTop: TOKENS.spacing.xs }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: TOKENS.colors.surfaceSubtle,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: TOKENS.colors.textSecondary,
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: TOKENS.spacing.lg, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: TOKENS.spacing.md }}>
          {children}
        </div>
      </div>
    </>
  );
};
