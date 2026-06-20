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
import BlogPost from "./pages/BlogPost.tsx";
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
import PwaCheck from "./pages/PwaCheck.tsx";
import GuestPost from "./pages/GuestPost.tsx";
import ContractorCityPage from "./pages/ContractorCityPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* reducedMotion="always" forces motion components to skip their initial
        hidden state and render at the final `animate` state immediately.
        This guarantees content is visible on first paint and in full-page
        captures (screenshots, crawlers) regardless of IntersectionObserver. */}
    <MotionConfig reducedMotion="always">
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
          <Route path="/guest-post" element={<GuestPost />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cities/:city" element={<CityPage />} />
          <Route path="/contractors/:trade/:city" element={<ContractorCityPage />} />
          <Route path="/scan-wizard" element={<ScanWizard />} />
          <Route path="/network" element={<Network />} />
          <Route path="/eyespyr" element={<EyeSpyr />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
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
          <Route path="/pwa-check" element={<PwaCheck />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
