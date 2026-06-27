import { motion } from "framer-motion";
import { Crown, Cpu, Truck, Tv, ExternalLink } from "lucide-react";
import loveourlistingsImg from "@/assets/flagship/loveourlistings.png.asset.json";
import weddingsImg from "@/assets/flagship/weddings-hero.jpg.asset.json";
import plowwowImg from "@/assets/flagship/plowwow-mascot.png.asset.json";
import kongtractorsImg from "@/assets/flagship/kongtractors.png.asset.json";
import promowsImg from "@/assets/flagship/promows.png.asset.json";
import buildershausImg from "@/assets/flagship/buildershaus-card.jpg.asset.json";
import errandsImg from "@/assets/flagship/errands-card.jpg.asset.json";
import treatmentsImg from "@/assets/flagship/treatments-card.jpg.asset.json";
import eyespyrImg from "@/assets/flagship/eyespyr-logo.png.asset.json";
import dentistsImg from "@/assets/flagship/dentists-card.jpg.asset.json";
import backhaulImg from "@/assets/flagship/backhaul-card-v2.jpg.asset.json";
import sparkysImg from "@/assets/flagship/sparkys-hero.jpg.asset.json";
import paintersImg from "@/assets/flagship/painters-card-v2.jpg.asset.json";
import floathomesImg from "@/assets/flagship/floathomes-hero.jpg.asset.json";
import excavatorsImg from "@/assets/flagship/excavators-hero.jpg.asset.json";
import caterersImg from "@/assets/flagship/caterers-card.png.asset.json";
import caterersHeroImg from "@/assets/flagship/caterers-hero-overlay.jpg.asset.json";
import ranchersImg from "@/assets/flagship/ranchers-card.png.asset.json";
import decoratorImg from "@/assets/flagship/decorator-card.png.asset.json";
import pitchdecktvImg from "@/assets/flagship/pitchdecktv-hero.jpg.asset.json";
import talcImg from "@/assets/flagship/talc-hero.jpg.asset.json";

type Brand = { name: string; url: string; tagline: string; image?: string; contain?: boolean };

const groups: { icon: typeof Crown; eyebrow: string; title: string; blurb: string; brands: Brand[] }[] = [
  {
    icon: Crown,
    eyebrow: "Flagship Brands",
    title: "Category-Defining Properties",
    blurb: "Owned, operated, and ranking. Proof we don't just market brands — we build them.",
    brands: [
      { name: "LoveOurListings", url: "https://loveourlistings.com", tagline: "Real Estate Showcase Network", image: loveourlistingsImg.url },
      { name: "Weddings.io", url: "https://weddings.io", tagline: "Premium Wedding Vendor Network", image: weddingsImg.url },
      { name: "Plowwow.com", url: "https://plowwow.com", tagline: "Snow & Site Services Marketplace", image: plowwowImg.url },
      { name: "Kongtractors.com", url: "https://kongtractors.com", tagline: "Heavy Trade Contractor Directory", image: kongtractorsImg.url },
      { name: "ProMows.com", url: "https://promows.com", tagline: "Lawn Care & Grounds Network", image: promowsImg.url },
      { name: "BuildersHaus.com", url: "https://buildershaus.com", tagline: "Premium Builder & Renovation Hub", image: buildershausImg.url },
      { name: "Dentists.ltd", url: "https://dentists.ltd", tagline: "Premium Dental Network", image: dentistsImg.url },
    ],
  },
  {
    icon: Tv,
    eyebrow: "TV Media Network",
    title: "Our .TV Video Networks",
    blurb: "Premium .tv domains built as full video showcases — long-form storytelling, vendor reels, and category authority.",
    brands: [
      { name: "Treatments.tv", url: "https://treatments.tv", tagline: "Health & Wellness Video Network", image: treatmentsImg.url },
      { name: "Sparkys.tv", url: "https://sparkys.tv", tagline: "Electricians Video Network", image: sparkysImg.url },
      { name: "Painters.tv", url: "https://painters.tv", tagline: "Pro Painter Showcase Network", image: paintersImg.url },
      { name: "Decorator.tv", url: "https://decorator.tv", tagline: "Interior Decorator Studio Network", image: decoratorImg.url },
      { name: "FloatHomes.tv", url: "https://floathomes.tv", tagline: "Floating Home Lifestyle Network", image: floathomesImg.url },
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
      { name: "Talc.tv", url: "https://talc.tv", tagline: "Visual Blast Distribution Engine", image: talcImg.url },
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
            Brand Experts · Domain Holders · Digital All-Rounders
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-5">
            We Don't Just Market Brands —<br />
            <span className="text-primary text-glow">We Build Them</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Every business inside the Industry Army ecosystem stands on the same foundation we built our own
            flagship properties on: premium domains, proprietary tech, and a distribution network nobody else
            owns. This is the value of being in.
          </p>
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
                    className="group rounded-lg bg-card border border-border hover:border-primary/50 hover:border-glow transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {brand.image && (
                      <div className="relative aspect-square overflow-hidden bg-background">
                        <img
                          src={brand.image}
                          alt={`${brand.name} — ${brand.tagline}`}
                          loading="lazy"
                          className={`w-full h-full group-hover:scale-[1.03] transition-transform duration-500 ${
                            brand.contain ? "object-contain p-6" : "object-cover"
                          }`}
                        />
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