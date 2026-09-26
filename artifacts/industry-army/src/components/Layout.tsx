import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureReferral } from "@/lib/enquiryAttribution";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { DisambiguationNotice } from "./DisambiguationNotice";

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname, search } = useLocation();
  useEffect(() => { captureReferral(); }, [pathname, search]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <div className="container mx-auto px-4 max-w-6xl">
        <DisambiguationNotice />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;