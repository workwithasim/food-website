import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  style,
  ...props
}: ButtonProps): React.JSX.Element {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    borderRadius: "var(--radius-md, 8px)",
    cursor: disabled || isLoading ? "not-allowed" : "pointer",
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: "all 0.15s ease-in-out",
    border: "1px solid transparent",
    fontFamily: "var(--font-body)",
    ...style
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--color-brand-primary, #e11d48)",
      color: "var(--color-brand-on-primary, #ffffff)"
    },
    secondary: {
      backgroundColor: "var(--color-surface-muted, #f4f4f5)",
      color: "var(--color-text, #09090b)",
      borderColor: "var(--color-border, #e4e4e7)"
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--color-text, #09090b)",
      borderColor: "var(--color-border, #e4e4e7)"
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--color-text, #09090b)"
    },
    danger: {
      backgroundColor: "var(--color-danger, #dc2626)",
      color: "#ffffff"
    }
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 12px", fontSize: "0.875rem", minHeight: "36px" },
    md: { padding: "10px 18px", fontSize: "1rem", minHeight: "44px" },
    lg: { padding: "14px 24px", fontSize: "1.125rem", minHeight: "52px" }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        ...baseStyle,
        ...(variantStyles[variant] || variantStyles.primary),
        ...(sizeStyles[size] || sizeStyles.md)
      }}
      className={`restaurant-btn ${className}`}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};
