import React from "react";

interface BrandTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  showTm?: boolean;
  style?: React.CSSProperties;
}

const BrandText = React.forwardRef<HTMLElement, BrandTextProps>(
  ({ text, className = "", as: Tag = "span", showTm = false, style }, ref) => {
    const parts = text.split(/(\d)/g);
    const Component = Tag as React.ElementType;

    return (
      <Component ref={ref as never} className={className} style={style}>
        {parts.map((part, i) =>
          /\d/.test(part) ? (
            <span
              key={i}
              style={{
                fontSize: "2em",
                fontWeight: 800,
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
          <span style={{ fontSize: "0.4em", fontWeight: 600, verticalAlign: "super", marginLeft: "0.05em", fontFamily: "'Space Grotesk', sans-serif" }}>™</span>
        )}
      </Component>
    );
  }
);

BrandText.displayName = "BrandText";

export default BrandText;
