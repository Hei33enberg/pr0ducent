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
    /* header: murd0ch Index “0” = 1.8em; ™ = 0.4em (both variants) */
    const digitEm = variant === "header" ? 1.8 : 2;
    const tmEm = 0.4;

    return (
      <Component ref={ref as never} className={className} style={style}>
        {parts.map((part, i) =>
          /\d/.test(part) ? (
            <span
              key={i}
              style={{
                fontSize: `${digitEm}em`,
                fontWeight: 800,
                /* Line-height 1: keeps flex vertical centering stable in PageFrame header (0.8 looked top-heavy vs CTA). */
                lineHeight: 1,
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
