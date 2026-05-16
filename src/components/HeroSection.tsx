import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-primary uppercase tracking-[0.3em] text-sm font-semibold mb-4"
        >
          Foolproof Strategy Reveals How To
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-display text-6xl md:text-8xl lg:text-9xl leading-none mb-6 text-glow text-primary"
        >
          The $10 Marketing
          <br />
          Revolution
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-muted-foreground max-w-2xl mx-auto text-lg mb-10 leading-relaxed"
        >
          Over 20 years, marketing has transformed—and now the power is in your hands. 
          Claim your exclusive territory, crush the competition, and become the go-to 
          business in your area before anyone else.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="hero" size="lg" asChild>
            <a href="#contact">Get Started</a>
          </Button>
          <Button variant="heroOutline" size="lg" asChild>
            <a href="#services">Our Services</a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl"
        >
          <div>
            <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ paddingBottom: "177.78%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/mSofh5znBUA"
                title="Industry Army Marketing"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
          <div>
            <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-3">What Is IAM · $10 SEO Explained</p>
            <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ paddingBottom: "177.78%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/QoeW39BxFT4"
                title="What Is IAM — $10 SEO Explained"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px gradient-neon-line opacity-40" />
    </section>
  );
};

export default HeroSection;
