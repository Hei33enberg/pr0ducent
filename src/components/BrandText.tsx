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
    /* header: murd0ch Index.tsx — same middle glyph: 1.8em, lh 0.8, baseline (not “floating” zero) */
    const digitEm = variant === "header" ? 1.8 : 2;
    const tmEm = 0.4;

    const mergedClass =
      variant === "header"
        ? `${className} inline-flex flex-nowrap items-baseline`.trim()
        : className;

    return (
      <Component ref={ref as never} className={mergedClass} style={style}>
        {parts.map((part, i) =>
          /\d/.test(part) ? (
            <span
              key={i}
              style={
                variant === "header"
                  ? {
                      fontSize: `${digitEm}em`,
                      fontWeight: 800,
                      lineHeight: 0.8,
                      verticalAlign: "baseline",
                      letterSpacing: "-0.02em",
                    }
                  : {
                      fontSize: `${digitEm}em`,
                      fontWeight: 800,
                      lineHeight: 1,
                      verticalAlign: "baseline",
                      letterSpacing: "-0.02em",
                    }
              }
            >
              {part}
            </span>
          ) : (
            <span key={i} className={variant === "header" ? "leading-none" : undefined}>
              {part}
            </span>
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
