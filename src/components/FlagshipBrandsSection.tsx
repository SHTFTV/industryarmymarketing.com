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
import floathomesImg from "@/assets/flagship/floathomes-hero.jpg.asset.json";
import excavatorsImg from "@/assets/flagship/excavators-hero.jpg.asset.json";
import caterersImg from "@/assets/flagship/caterers-card.png.asset.json";
import caterersHeroImg from "@/assets/flagship/caterers-hero-overlay.jpg.asset.json";
import ranchersImg from "@/assets/flagship/ranchers-card.png.asset.json";
import decoratorImg from "@/assets/flagship/decorator-card.png.asset.json";
import pitchdecktvImg from "@/assets/flagship/pitchdecktv-hero.jpg.asset.json";
import talcImg from "@/assets/flagship/talc-hero.jpg.asset.json";
import videographersImg from "@/assets/flagship/videographers-card-v2.png.asset.json";
import weddingsLogo from "@/assets/flagship/weddings-io-logo.png.asset.json";

type Brand = { name: string; url: string; tagline: string; image?: string; contain?: boolean; seo?: string; logoOverlay?: string; logoPosition?: "center" | "bottom" };

const groups: { icon: typeof Crown; eyebrow: string; title: string; blurb: string; brands: Brand[] }[] = [
  {
    icon: Crown,
    eyebrow: "Flagship Brands",
    title: "Category-Defining Properties",
    blurb: "Owned, operated, and ranking. Proof we don't just market brands — we build them.",
    brands: [
      { name: "LoveOurListings", url: "https://loveourlistings.com", tagline: "Real Estate Showcase Network", image: loveourlistingsImg.url, seo: "Exclusive real estate showcase network pairing verified agents with high-intent buyers across North America. One agent per city — permanent listings, video tours, and dofollow authority from a 20+ year premium domain." },
      { name: "Weddings.io", url: "https://weddings.io", tagline: "Premium Wedding Vendor Network", image: weddingsImg.url, logoOverlay: weddingsLogo.url, seo: "The category-defining .io domain for the $300B global wedding industry. 1,018 cities, 24 countries, 9 cultural verticals — verified planners, photographers, and venues locked to one exclusive slot per metro." },
      { name: "Plowwow.com", url: "https://plowwow.com", tagline: "Snow & Site Services Marketplace", image: plowwowImg.url, logoOverlay: plowwowLogo.url, logoPosition: "bottom", seo: "Snow removal, de-icing, and winter site services — one operator per city, dispatched with real-time storm routing. Trusted by strata, retail, and municipal clients across Canada and the northern US." },
      { name: "Kongtractors.com", url: "https://kongtractors.com", tagline: "Heavy Trade Contractor Directory", image: kongtractorsImg.url, seo: "Heavy-trade contractor directory built for commercial GCs, developers, and site supers. Excavation, framing, concrete, and rebar specialists — verified by EyeSpyR and ranked on niche-relevant premium domains." },
      { name: "ProMows.com", url: "https://promows.com", tagline: "Lawn Care & Grounds Network", image: promowsImg.url, seo: "Full-season lawn care, landscape maintenance, and grounds management network. Route-optimized crews, hardscape upsell channels, and territory-locked exclusivity for professional landscapers." },
      { name: "BuildersHaus.com", url: "https://buildershaus.com", tagline: "Premium Builder & Renovation Hub", image: buildershausImg.url, seo: "Custom home builders, renovation specialists, and design-build firms showcased with project galleries, EyeSpyR verification, and TALC.tv video posts. One builder per city — permanent authority backlinks." },
      { name: "Dentists.ltd", url: "https://dentists.ltd", tagline: "Premium Dental Network", image: dentistsImg.url, seo: "Premium dental practice network covering family, cosmetic, implant, and orthodontic clinics. Verified profiles, patient review capture, and dofollow SEO from a category-defining .ltd domain." },
      { name: "Treatments.tv", url: "https://treatments.tv", tagline: "Health & Wellness Video Network", image: treatmentsImg.url, seo: "Health, wellness, and elective treatment provider network delivered as a full video showcase. Clinic reels, before/after tours, and TALC.tv-powered distribution to booking-ready patients." },
    ],
  },
  {
    icon: Tv,
    eyebrow: "TV Media Network",
    title: "Our .TV Video Networks",
    blurb: "Premium .tv domains built as full video showcases — long-form storytelling, vendor reels, and category authority.",
    brands: [
      { name: "Sparkys.tv", url: "https://sparkys.tv", tagline: "Electricians Video Network", image: sparkysImg.url, seo: "Licensed electricians and electrical contractors on video. Panel upgrades, EV charger installs, service calls — verified operators with dofollow backlinks from a category-defining .tv domain." },
      { name: "Painters.tv", url: "https://painters.tv", tagline: "Pro Painter Showcase Network", image: paintersImg.url, seo: "Interior and exterior painting contractors showcased with project reels and color-consult videos. Residential, commercial, and strata painters — one crew per city, permanent territory." },
      { name: "Decorator.tv", url: "https://decorator.tv", tagline: "Interior Decorator Studio Network", image: decoratorImg.url, seo: "Interior decorators and stagers with portfolio walk-throughs, room reveals, and vendor pairing. Premium .tv authority for high-ticket residential and hospitality clients." },
      { name: "FloatHomes.tv", url: "https://floathomes.tv", tagline: "Floating Home Lifestyle Network", image: floathomesImg.url, seo: "Float home builders, moorage brokers, and coastal lifestyle content. The only premium video domain dedicated to floating home ownership, refits, and marina living." },
      { name: "Excavators.tv", url: "https://excavators.tv", tagline: "Heavy Excavation Video Network", image: excavatorsImg.url, seo: "Site prep, foundation excavation, and heavy earthworks contractors on video. Fleet showcases, job-site reels, and verified operators for GCs and civil developers." },
      { name: "Ranchers.tv", url: "https://ranchers.tv", tagline: "Ranch & Livestock Storytelling", image: ranchersImg.url, seo: "Working ranchers, livestock operations, and agri-lifestyle storytelling. Long-form video for beef, equine, and heritage ranches — plus vendor pairing for feed, fencing, and equipment." },
      { name: "Caterers.tv", url: "https://caterers.tv", tagline: "Premium Catering & Event Showcase Network", image: caterersHeroImg.url, seo: "Wedding, corporate, and private-event caterers with menu films, tasting reels, and venue partnerships. Category-defining .tv domain feeding Weddings.io and BuildersHaus.com." },
      { name: "PitchDeck.tv", url: "https://pitchdeck.tv", tagline: "Founder Pitch & Investor Video Network", image: pitchdecktvImg.url, seo: "Founder pitch videos, investor-grade deck walk-throughs, and startup category showcases. Premium .tv distribution for pre-seed through Series B storytelling." },
    ],
  },
  {
    icon: Cpu,
    eyebrow: "Marketing Tech",
    title: "Our In-House Stack",
    blurb: "Proprietary tools that power every campaign we run — and that you get access to inside the ecosystem.",
    brands: [
      { name: "EyeSpyR.com", url: "https://eyespyr.com", tagline: "Contractor Verification & Trust Badge", image: eyespyrImg.url, contain: true, seo: "Physical on-site contractor verification — an EyeSpyR inspector confirms the business exists at the address it claims. Trust badges, verified reviews, and anti-fraud citations for every IAM listing." },
      { name: "Videographers.io", url: "https://videographers.io", tagline: "Curated Talent For Your Next Project", image: videographersImg.url, seo: "Curated videographer network powering Weddings.io reels, Treatments.tv clinic tours, and PitchDeck.tv founder films. Verified talent, fixed rates, and city-locked exclusivity." },
      { name: "Talc.tv", url: "https://talc.tv", tagline: "Visual Blast Distribution Engine", image: talcImg.url, seo: "TALC.tv is IAM's visual blast distribution engine — one upload fans out to 40+ premium domain properties, Google Business Profile posts, and syndication endpoints. Powers every content beat in the ecosystem." },
    ],
  },
  {
    icon: Truck,
    eyebrow: "Transportation Disruptors",
    title: "Logistics Reimagined",
    blurb: "Disrupting how goods, gear, and crews move — the same playbook we apply to your industry.",
    brands: [
      { name: "Errands.io", url: "https://errands.io", tagline: "Drone & Last-Mile Services", image: errandsImg.url, seo: "Last-mile errand routing and drone-assisted delivery for retail, medical, and industrial pickups. Premium .io category domain built for the on-demand logistics era." },
      { name: "Backhaul.io", url: "https://backhaul.io", tagline: "Smart Freight & Backhaul Network", image: backhaulImg.url, seo: "Smart freight and empty-mile backhaul matching for long-haul carriers. Turn deadhead miles into revenue with verified brokers, load transparency, and category-defining .io authority." },
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