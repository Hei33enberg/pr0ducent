import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Swords, Calculator, Newspaper, HelpCircle, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const items = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Compare", icon: Swords, href: "#comparison" },
  { label: "Pricing", icon: Calculator, href: "/pricing" },
  { label: "Blog", icon: Newspaper, href: "/blog" },
  { label: "Live", icon: Radio, href: "/runs-now" },
  { label: "FAQ", icon: HelpCircle, href: "#faq" },
];

export function FloatingToolbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only show on homepage
  if (location.pathname !== "/") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5 rounded-full bg-card/90 backdrop-blur-xl border border-border/60 shadow-2xl"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => {
                  if (item.href.startsWith("#")) {
                    document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate(item.href);
                  }
                }}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-sans font-medium">{item.label}</span>
              </button>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
