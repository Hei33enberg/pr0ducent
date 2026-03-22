import { useInView } from "@/hooks/useInView";

interface BigHeadlineProps {
  text: string;
  wash?: "blush" | "indigo" | "gold" | "teal";
}

const BigHeadline = ({ text, wash = "blush" }: BigHeadlineProps) => {
  const { ref, isVisible } = useInView();

  const washClass = wash === "indigo" ? "section-wash-indigo"
    : wash === "gold" ? "section-wash-gold"
    : wash === "teal" ? "section-wash-teal"
    : "section-wash-blush";

  return (
    <div
      ref={ref}
      className={`py-10 sm:py-14 md:py-20 text-center px-4 ${washClass} fade-up ${isVisible ? "visible" : ""}`}
    >
      <p
        className="font-serif leading-[1.1] tracking-[-0.02em]"
        style={{ fontSize: "clamp(3.2rem, 8vw + 1rem, 9rem)", color: 'hsl(0, 0%, 0%)' }}
      >
        {text}
      </p>
    </div>
  );
};

export default BigHeadline;
