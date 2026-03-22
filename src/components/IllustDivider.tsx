import { useRef, useState, useEffect } from "react";

interface IllustDividerProps {
  src: string;
  alt: string;
  className?: string;
  animClass?: string;
  videoSrc?: string;
}

const IllustDivider = ({ src, alt, className = "", animClass = "", videoSrc }: IllustDividerProps) => {
  const sharedClasses = `max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full max-h-[280px] sm:max-h-[360px] md:max-h-[440px] object-contain select-none pointer-events-none`;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (!videoSrc || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.src = videoSrc;
          videoRef.current.load();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [videoSrc]);

  return (
    <div ref={containerRef} className={`flex justify-center py-1 sm:py-2 md:py-4 overflow-hidden ${className}`}>
      {videoSrc ? (
        <>
          <video
            ref={videoRef}
            className={`${sharedClasses} ${animClass} ${videoLoaded ? "" : "hidden"}`}
            style={{ filter: "contrast(1.3) saturate(0)", opacity: 0.70 }}
            autoPlay
            loop
            muted
            playsInline
            onCanPlay={() => setVideoLoaded(true)}
          />
          {!videoLoaded && (
            <img
              src={src}
              alt={alt}
              className={`${sharedClasses} ${animClass}`}
              style={{ filter: "contrast(1.3) saturate(0)", opacity: 0.70 }}
              loading="lazy"
              decoding="async"
            />
          )}
        </>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${sharedClasses} ${animClass}`}
          style={{ filter: "contrast(1.3) saturate(0)", opacity: 0.70 }}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default IllustDivider;
