import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-7xl md:text-9xl font-serif font-bold tracking-tight text-foreground">
          {t("notFound.title")}
        </h1>
        <p className="text-lg text-muted-foreground font-sans">{t("notFound.message")}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-foreground text-background px-6 py-3 text-sm font-semibold rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-sans inline-flex items-center gap-2"
        >
          {t("notFound.back")}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
