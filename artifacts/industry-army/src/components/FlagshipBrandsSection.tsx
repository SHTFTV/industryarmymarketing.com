import { motion } from "framer-motion";
import { Crown, Cpu, Truck, Tv, ExternalLink } from "lucide-react";
import loveourlistingsImg from "@/assets/flagship/loveourlistings.png.asset.json";
import weddingsImg from "@/assets/flagship/weddings-hero.jpg.asset.json";
import plowwowImg from "@/assets/flagship/plowwow-mascot-hero.jpg.asset.json";
import plowwowLogo from "@/assets/flagship/plowwow-logo.png.asset.json";
import kongtractorsImg from "@/assets/flagship/kongtractors.png.asset.json";
import promowsImg from "@/assets/flagship/promows.png.asset.json";
import buildershausImg from "@/assets/flagship/buildershaus-card.jpg.asset.json";
import errandsImg from "@/assets/flagship/errands-card.jpg.asset.json";
import treatmentsImg from "@/assets/flagship/treatments-card.jpg.asset.json";
import eyespyrImg from "@/assets/flagship/eyespyr-logo.png.asset.json";
import dentistsImg from "@/assets/flagship/dentists-card.jpg.asset.json";
import backhaulImg from "@/assets/flagship/backhaul-card-v2.jpg.asset.json";
import sparkysImg from "@/assets/flagship/sparkys-hero.jpg.asset.json";
import paintersImg from "@/assets/flagship/painters-card.png.asset.json";
import rebarImg from "@/assets/flagship/rebar-card.jpg.asset.json";
import excavatorsImg from "@/assets/flagship/excavators-hero.jpg.asset.json";
import caterersImg from "@/assets/flagship/caterers-card.png.asset.json";
import caterersHeroImg from "@/assets/flagship/caterers-hero-overlay.jpg.asset.json";
import ranchersImg from "@/assets/flagship/ranchers-card.png.asset.json";
import decoratorImg from "@/assets/flagship/decorator-card.png.asset.json";
import pitchdecktvImg from "@/assets/flagship/pitchdecktv-hero.jpg.asset.json";
import talcImg from "@/assets/flagship/talc-hero.jpg.asset.json";
import videographersImg from "@/assets/flagship/videographers-card-v2.png.asset.json";
import weddingsLogo from "@/assets/flagship/weddings-io-logo.png.asset.json";
import weddingsaasImg from "@/assets/flagship/weddingsaas-card.jpg.asset.json";

import roofersImg from "@/assets/flagship/roofers-card.jpg.asset.json";

type Brand = { name: string; url: string; tagline: string; image?: string; contain?: boolean; seo?: string; logoOverlay?: string; logoPosition?: "center" | "bottom" };

const groups: { icon: typeof Crown; eyebrow: string; title: string; blurb: string; brands: Brand[] }[] = [
  {
    icon: Crown,
    eyebrow: "Flagship Brands",
    title: "Find your industry. Bring your business.",
    blurb: "IAM-created brands and publishing destinations. Explore the relevant site, then ask us about participation and current opportunities.",
    brands: [
      { name: "Kongtractors.com", url: "https://kongtractors.com", tagline: "Heavy Trade Contractor Directory", image: kongtractorsImg.url },
      { name: "Plowwow.com", url: "https://plowwow.com", tagline: "Snow & Site Services Marketplace", image: plowwowImg.url, logoOverlay: plowwowLogo.url, logoPosition: "bottom" },
      { name: "LoveOurListings", url: "https://loveourlistings.com", tagline: "Real Estate Showcase Network", image: loveourlistingsImg.url },
      { name: "Dentists.ltd", url: "https://dentists.ltd", tagline: "Premium Dental Network", image: dentistsImg.url },
      { name: "Roofers.io", url: "https://roofers.io", tagline: "Roofing businesses, projects and industry resources", image: roofersImg.url },
      { name: "Weddings.io", url: "https://weddings.io", tagline: "Premium Wedding Vendor Network", image: weddingsImg.url, logoOverlay: weddingsLogo.url },
      { name: "Treatments.tv", url: "https://treatments.tv", tagline: "Health & Wellness Video Network", image: treatmentsImg.url },
      { name: "ProMows.com", url: "https://promows.com", tagline: "Lawn Care & Grounds Network", image: promowsImg.url },
      { name: "BuildersHaus.com", url: "https://buildershaus.com", tagline: "Premium Builder & Renovation Hub", image: buildershausImg.url },
      { name: "Med Bee Tate", url: "https://medbeetate.com", tagline: "Bee-inspired meditation & gathering concept", image: "/images/bee-portfolio/med-bee-tate.webp" },
      { name: "BeeGoods.co", url: "https://beegoods.co", tagline: "The next chapter in bee-inspired goods", image: "/images/bee-portfolio/beegoods.webp" },
    ],
  },
  {
    icon: Tv,
    eyebrow: "TV Media Network",
    title: "Our .TV Video Networks",
    blurb: "Premium .tv domains built as full video showcases — long-form storytelling, vendor reels, and category authority.",
    brands: [
      { name: "Sparkys.tv", url: "https://sparkys.tv", tagline: "Electricians Video Network", image: sparkysImg.url },
      { name: "Painters.tv", url: "https://painters.tv", tagline: "Pro Painter Showcase Network", image: paintersImg.url },
      { name: "Decorator.tv", url: "https://decorator.tv", tagline: "Interior Decorator Studio Network", image: decoratorImg.url },
      { name: "Rebar.tv", url: "https://rebar.tv", tagline: "Rebar & Reinforcement Video Network", image: rebarImg.url },
      { name: "Excavators.tv", url: "https://excavators.tv", tagline: "Heavy Excavation Video Network", image: excavatorsImg.url },
      { name: "Ranchers.tv", url: "https://ranchers.tv", tagline: "Ranch & Livestock Storytelling", image: ranchersImg.url },
      { name: "Caterers.tv", url: "https://caterers.tv", tagline: "Premium Catering & Event Showcase Network", image: caterersHeroImg.url },
      { name: "PitchDeck.tv", url: "https://pitchdeck.tv", tagline: "Founder Pitch & Investor Video Network", image: pitchdecktvImg.url },
    ],
  },
  {
    icon: Cpu,
    eyebrow: "Marketing Tech",
    title: "Our In-House Stack",
    blurb: "Proprietary tools that power every campaign we run — and that you get access to inside the ecosystem.",
    brands: [
      { name: "EyeSpyR.com", url: "https://eyespyr.com", tagline: "Contractor Verification & Trust Badge", image: eyespyrImg.url, contain: true },
      { name: "Videographers.io", url: "https://videographers.io", tagline: "Curated Talent For Your Next Project", image: videographersImg.url },
      { name: "Talc.tv", url: "https://talc.tv", tagline: "Visual Blast Distribution Engine", image: talcImg.url },
      { name: "WeddingSaaS.com", url: "https://weddingsaas.com", tagline: "Wedding SaaS News & Ratings", image: weddingsaasImg.url },
    ],
  },
  {
    icon: Truck,
    eyebrow: "Transportation Disruptors",
    title: "Logistics Reimagined",
    blurb: "Disrupting how goods, gear, and crews move — the same playbook we apply to your industry.",
    brands: [
      { name: "Errands.io", url: "https://errands.io", tagline: "Drone & Last-Mile Services", image: errandsImg.url },
      { name: "Backhaul.io", url: "https://backhaul.io", tagline: "Smart Freight & Backhaul Network", image: backhaulImg.url },
    ],
  },
];

const FlagshipBrandsSection = () => {
  return (
    <section id="flagship-brands" className="py-24 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-primary uppercase tracking-[0.3em] text-sm font-semibold mb-3">
            OUR BRANDS / YOUR OPPORTUNITY
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-5">
            Brands we create and market.<br />
            <span className="text-primary text-glow">Networks you can join</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            These are IAM’s own brand platforms and publishing networks. They give businesses a relevant place to tell their story, show their work and connect with their industry. Explore a brand below, then talk with us about the participation, content or marketing option that fits your business. Availability, scope and terms are confirmed for each network.
          </p>
          <a href="/contact?request=network" className="inline-flex mt-6 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold">Talk to IAM about joining ↗</a>
        </motion.div>

        <div className="space-y-14">
          {groups.map((group, gi) => (
            <motion.div
              key={group.eyebrow}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: gi * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <group.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-primary uppercase tracking-[0.25em] text-xs font-semibold mb-1">
                    {group.eyebrow}
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl text-foreground leading-tight">
                    {group.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">{group.blurb}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.brands.map((brand) => (
                  <a
                    key={brand.name}
                    href={brand.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="iam-animated-brand group rounded-lg bg-card border border-border hover:border-primary/50 hover:border-glow transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {brand.image && (
                      <div className="iam-brand-picture relative aspect-square overflow-hidden bg-background">
                        <img
                          src={brand.image}
                          alt={`${brand.name} — ${brand.tagline}`}
                          loading="lazy"
                          className={`iam-brand-art w-full h-full ${
                            brand.contain ? "object-contain p-6" : "object-cover"
                          }`}
                        />
                        {brand.logoOverlay && (
                          <>
                            {brand.logoPosition === "bottom" ? (
                              <>
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                                <img
                                  src={brand.logoOverlay}
                                  alt={`${brand.name} logo`}
                                  loading="lazy"
                                  className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 w-[45%] max-w-[180px] h-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
                                />
                              </>
                            ) : (
                              <>
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/40" />
                                <img
                                  src={brand.logoOverlay}
                                  alt={`${brand.name} logo`}
                                  loading="lazy"
                                  className="pointer-events-none absolute inset-0 m-auto w-[85%] h-auto drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)] brightness-125 contrast-125"
                                />
                              </>
                            )}
                          </>
                        )}
                        {brand.seo && (
                          <div
                            className="absolute inset-0 flex items-end bg-gradient-to-t from-black/95 via-black/80 to-black/20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-300 pointer-events-none"
                          >
                            <p className="text-white text-[13px] leading-snug p-4 font-medium drop-shadow-lg">
                              {brand.seo}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-5 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-display text-2xl text-primary text-glow">{brand.name}</h4>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>
                      <p className="text-muted-foreground text-sm">{brand.tagline}</p>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlagshipBrandsSection;