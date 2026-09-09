import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "muted";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
  style,
  ...props
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: "rgba(225, 29, 72, 0.1)",
      color: "var(--color-brand-primary, #e11d48)"
    },
    success: {
      backgroundColor: "rgba(22, 163, 74, 0.1)",
      color: "var(--color-success, #16a34a)"
    },
    warning: {
      backgroundColor: "rgba(234, 88, 12, 0.1)",
      color: "var(--color-warning, #ea580c)"
    },
    danger: {
      backgroundColor: "rgba(220, 38, 38, 0.1)",
      color: "var(--color-danger, #dc2626)"
    },
    muted: {
      backgroundColor: "var(--color-surface-muted, #f4f4f5)",
      color: "var(--color-text-muted, #71717a)"
    }
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "var(--radius-sm, 4px)",
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1,
    ...variantStyles[variant],
    ...style
  };

  return (
    <span style={badgeStyle} className={`restaurant-badge ${className}`} {...props}>
      {children}
    </span>
  );
};
