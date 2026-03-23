import { useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  crumbs: BreadcrumbItem[];
  className?: string;
}

/**
 * Consistent breadcrumb bar — appears below the sticky header on inner pages.
 * Home crumb is always prepended automatically.
 */
export function PageBreadcrumb({ crumbs, className }: PageBreadcrumbProps) {
  const navigate = useNavigate();

  const all: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...crumbs];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-[11px] font-sans text-muted-foreground mb-6 mt-1", className)}
    >
      {all.map((crumb, i) => {
        const isLast = i === all.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i === 0 && <Home className="w-3 h-3 shrink-0" />}
            {crumb.href && !isLast ? (
              <button
                onClick={() => navigate(crumb.href!)}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className={isLast ? "text-foreground font-medium" : ""}>{crumb.label}</span>
            )}
            {!isLast && <ChevronRight className="w-3 h-3 shrink-0 opacity-40" />}
          </span>
        );
      })}
    </nav>
  );
}
