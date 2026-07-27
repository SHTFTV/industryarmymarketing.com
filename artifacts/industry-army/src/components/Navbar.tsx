import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import { Rss } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
  { label: "SEO Packages", to: "/seo-packages" },
  { label: "Network", to: "/network" },
  { label: "EyeSpyr", to: "/eyespyr" },
  { label: "Blog", to: "/blog" },
  { label: "Guest Post", to: "/guest-post" },
  { label: "Free Scan", to: "/scan-wizard" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-display text-2xl tracking-wider text-primary text-glow">
          IAM
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => {
                if (link.to === "/blog") {
                  console.log("Blog nav clicked, navigating to:", link.to);
                }
              }}
              className={({ isActive }) =>
                `text-xs font-medium hover:text-primary transition-colors uppercase tracking-widest ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <a
            href="/rss.xml"
            aria-label="Subscribe to the Industry Army Marketing RSS feed"
            title="RSS feed"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Rss size={16} />
          </a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden text-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="flex flex-col px-4 pb-4 gap-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => {
                    if (link.to === "/blog") {
                      console.log("Blog nav clicked, navigating to:", link.to);
                    }
                    setOpen(false);
                  }}
                  className={({ isActive }) =>
                    `text-sm font-medium hover:text-primary transition-colors uppercase tracking-widest py-2 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
