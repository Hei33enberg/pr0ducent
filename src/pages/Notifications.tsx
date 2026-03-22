import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { PageFrame } from "@/components/PageFrame";
import { Footer } from "@/components/Footer";
import AmbientBackground from "@/components/AmbientBackground";
import { NotificationSettings } from "@/components/NotificationSettings";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="min-h-screen">
        <AmbientBackground />
        <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
          <div className="px-4 sm:px-8 lg:px-12 py-20 text-center max-w-2xl mx-auto">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
              {t("notifications.signInRequired")}
            </h1>
            <p className="text-muted-foreground font-sans mb-6">
              {t("notifications.signInDesc")}
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="bg-foreground text-background px-6 py-2.5 text-sm font-semibold rounded-full font-sans"
            >
              {t("nav.getStarted")}
            </button>
          </div>
          <Footer />
        </PageFrame>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner-narrow py-12 sm:py-16">
          <h1
            className="font-serif font-bold tracking-[-0.02em] text-foreground mb-4"
            style={{ fontSize: "clamp(2.2rem, 4vw + 0.8rem, 4.5rem)" }}
          >
            {t("notifications.title")}
          </h1>
          <p className="text-muted-foreground font-sans text-lg mb-10">
            {t("notifications.subtitle")}
          </p>
          <NotificationSettings />
        </div>
        <Footer />
      </PageFrame>
    </div>
  );
}
