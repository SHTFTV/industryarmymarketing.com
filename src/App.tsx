import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";
import Pricing from "./pages/Pricing.tsx";
import Contractors from "./pages/Contractors.tsx";
import ServiceProfessionals from "./pages/ServiceProfessionals.tsx";
import Backlinks from "./pages/Backlinks.tsx";
import DofollowBacklinks from "./pages/DofollowBacklinks.tsx";
import Industries from "./pages/Industries.tsx";
import Contact from "./pages/Contact.tsx";
import CityPage from "./pages/CityPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import Network from "./pages/Network.tsx";
import EyeSpyr from "./pages/EyeSpyr.tsx";
import Builder from "./pages/Builder.tsx";
import Blog from "./pages/Blog.tsx";
import Investors from "./pages/Investors.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import WallOfLove from "./pages/WallOfLove.tsx";
import Legal from "./pages/Legal.tsx";
import SteelStud from "./pages/SteelStud.tsx";
import MiningLogistics from "./pages/MiningLogistics.tsx";
import ScanWizard from "./pages/ScanWizard.tsx";
import LocalVancouver from "./pages/local/Vancouver.tsx";
import LocalSurrey from "./pages/local/Surrey.tsx";
import LocalLangley from "./pages/local/Langley.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLeads from "./pages/admin/AdminLeads.tsx";

const queryClient = new QueryClient();

// Detect headless/automation (screenshot tools, crawlers) so motion components
// render at their final `animate` state instead of waiting on IntersectionObserver.
const isHeadless =
  typeof navigator !== "undefined" &&
  (/HeadlessChrome|Puppeteer|Playwright|Lighthouse|bot|crawler|spider/i.test(navigator.userAgent) ||
    (navigator as Navigator & { webdriver?: boolean }).webdriver === true);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion={isHeadless ? "always" : "user"}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contractors" element={<Contractors />} />
          <Route path="/service-professionals" element={<ServiceProfessionals />} />
          <Route path="/backlinks" element={<Backlinks />} />
          <Route path="/dofollow-backlinks" element={<DofollowBacklinks />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cities/:city" element={<CityPage />} />
          <Route path="/scan-wizard" element={<ScanWizard />} />
          <Route path="/network" element={<Network />} />
          <Route path="/eyespyr" element={<EyeSpyr />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wall-of-love" element={<WallOfLove />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/niches/steel-stud" element={<SteelStud />} />
          <Route path="/niches/mining-logistics" element={<MiningLogistics />} />
          <Route path="/local/vancouver" element={<LocalVancouver />} />
          <Route path="/local/surrey" element={<LocalSurrey />} />
          <Route path="/local/langley" element={<LocalLangley />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
