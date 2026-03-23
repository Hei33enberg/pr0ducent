import React from "react";

interface BrandTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  showTm?: boolean;
  style?: React.CSSProperties;
  /**
   * Tighter digit + ™ scale for the sticky nav bar (murd0ch parity: avoids clipping / overlap with row height).
   * Default uses larger “0” for marketing blocks.
   */
  variant?: "default" | "header";
}

const BrandText = React.forwardRef<HTMLElement, BrandTextProps>(
  ({ text, className = "", as: Tag = "span", showTm = false, style, variant = "default" }, ref) => {
    const parts = text.split(/(\d)/g);
    const Component = Tag as React.ElementType;
    const digitEm = variant === "header" ? 1.62 : 2;
    const tmEm = variant === "header" ? 0.35 : 0.4;

    return (
      <Component ref={ref as never} className={className} style={style}>
        {parts.map((part, i) =>
          /\d/.test(part) ? (
            <span
              key={i}
              style={{
                fontSize: `${digitEm}em`,
                fontWeight: 800,
                lineHeight: variant === "header" ? 0.85 : 1,
                verticalAlign: "baseline",
                letterSpacing: "-0.02em",
              }}
            >
              {part}
            </span>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
        {showTm && (
          <span
            style={{
              fontSize: `${tmEm}em`,
              fontWeight: 600,
              verticalAlign: "super",
              marginLeft: "0.05em",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            ™
          </span>
        )}
      </Component>
    );
  }
);

BrandText.displayName = "BrandText";

export default BrandText;
