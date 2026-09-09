import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = "md",
  className = "",
  style,
  ...props
}) => {
  const paddingMap: Record<string, string> = {
    none: "0",
    sm: "12px",
    md: "20px",
    lg: "32px"
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--color-surface, #ffffff)",
    border: "1px solid var(--color-border, #e4e4e7)",
    borderRadius: "var(--radius-lg, 12px)",
    padding: paddingMap[padding] || "20px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
    ...style
  };

  return (
    <div style={cardStyle} className={`restaurant-card ${className}`} {...props}>
      {children}
    </div>
  );
};
