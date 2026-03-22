interface IllustDividerProps {
  src: string;
  alt: string;
  className?: string;
  animClass?: string;
}

const IllustDivider = ({ src, alt, className = "", animClass = "" }: IllustDividerProps) => {
  const sharedClasses = `max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full max-h-[280px] sm:max-h-[360px] md:max-h-[440px] object-contain select-none pointer-events-none`;

  return (
    <div className={`flex justify-center py-1 sm:py-2 md:py-4 overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`${sharedClasses} ${animClass}`}
        style={{ filter: "contrast(1.3) saturate(0)", opacity: 0.70 }}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default IllustDivider;
