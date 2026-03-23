import { copy } from "@/lib/copy";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PageFrame } from "@/components/PageFrame";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Footer } from "@/components/Footer";
import AmbientBackground from "@/components/AmbientBackground";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="flex flex-col items-center justify-center px-4 py-24 sm:py-32 max-w-lg mx-auto w-full">
          <PageBreadcrumb className="mb-8 justify-center" crumbs={[{ label: copy["notFound.title"] }]} />
          <div className="text-center space-y-4">
            <h1 className="text-7xl md:text-9xl font-serif font-bold tracking-tight text-foreground">
              {copy["notFound.title"]}
            </h1>
            <p className="text-lg text-muted-foreground font-sans">{copy["notFound.message"]}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-foreground text-background px-6 py-3 text-sm font-semibold rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-sans inline-flex items-center gap-2"
            >
              {copy["notFound.back"]}
            </button>
          </div>
        </div>
        <Footer />
      </PageFrame>
    </div>
  );
};

export default NotFound;
