import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
