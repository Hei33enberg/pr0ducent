import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/lib/i18n";
import { lazy, Suspense } from "react";
import { ScrollToTop } from "./components/ScrollToTop.tsx";

const Index = lazy(() => import("./pages/Index.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const PublicExperiment = lazy(() => import("./pages/PublicExperiment.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const BuilderDashboard = lazy(() => import("./pages/BuilderDashboard.tsx"));
const Notifications = lazy(() => import("./pages/Notifications.tsx"));
const RunsNow = lazy(() => import("./pages/RunsNow.tsx"));
const CalculatorPage = lazy(() => import("./pages/Calculator.tsx"));
const UserDashboard = lazy(() => import("./pages/UserDashboard.tsx"));
const BuilderProfile = lazy(() => import("./pages/BuilderProfile.tsx"));
const BuildersIndex = lazy(() => import("./pages/BuildersIndex.tsx"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/experiment/:id" element={<PublicExperiment />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/dashboard/updates" element={<BuilderDashboard />} />
                <Route path="/dashboard/notifications" element={<Notifications />} />
                <Route path="/runs-now" element={<RunsNow />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/builders" element={<BuildersIndex />} />
                <Route path="/builders/:id" element={<BuilderProfile />} />
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
