import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/lib/i18n";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Pricing from "./pages/Pricing.tsx";
import PublicExperiment from "./pages/PublicExperiment.tsx";
import NotFound from "./pages/NotFound.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import BuilderDashboard from "./pages/BuilderDashboard.tsx";
import Notifications from "./pages/Notifications.tsx";
import RunsNow from "./pages/RunsNow.tsx";
import CalculatorPage from "./pages/Calculator.tsx";
import UserDashboard from "./pages/UserDashboard.tsx";
import { ScrollToTop } from "./components/ScrollToTop.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              <Route path="/experiment/:id" element={<PublicExperiment />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/dashboard/updates" element={<BuilderDashboard />} />
              <Route path="/dashboard/notifications" element={<Notifications />} />
              <Route path="/runs-now" element={<RunsNow />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
