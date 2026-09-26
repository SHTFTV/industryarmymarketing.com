import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Globe, Network, Video, MapPin, Ban } from "lucide-react";
import ContactSection from "@/components/ContactSection";

const reasons = [
  { icon: Globe, title: "Websites That Explain Your Work", body: "Show your services, service area, project photos and the information customers need before requesting an estimate. Make the enquiry route easy to find." },
  { icon: MapPin, title: "Local SEO for Your Service Area", body: "Review service pages, indexing, internal links and business information. Build useful content around the work you offer and measure search visibility and enquiries." },
  { icon: Video, title: "Project Stories and Industry Content", body: "Explain the problem, scope, approach and outcome of completed jobs. Share practical trade knowledge, photos and videos that help readers make decisions." },
  { icon: Network, title: "One-Hub Registration — $10/year", body: "Register on one relevant industry hub for $10 USD per year. Registration is separate from website services, SEO and city-page partnerships." },
  { icon: Lock, title: "Selective City-Page Partnerships", body: "For suitable businesses and creators contributing local knowledge and project content. Fit, scope, contributions and separate pricing are agreed before activation." },
  { icon: Ban, title: "Enquiry Tracking and Follow-Up", body: "Identify which website and service generated an enquiry. Track referrals, estimates and confirmed jobs separately so you can assess what is producing business." },
];

const Contractors = () => (
  <Layout>
    <Seo
      title="Contractor Marketing & SEO | Industry Army Marketing"
      description="Websites, local SEO, project content and industry hub opportunities for contractors. Explore IAM’s network work and discuss your trade, city and marketing needs."
      path="/contractors"
    />
    <PageHeader
      eyebrow="Built By Contractors · For Contractors"
      title="Construction &"
      highlight="Contractor Marketing"
      description="Help the right customers understand your work and take the next step. IAM supports contractors with websites, local SEO, project content and participation in relevant industry hubs."
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="hero" asChild><Link to="/contact?request=marketing">Discuss Your Marketing</Link></Button>
        <Button variant="heroOutline" asChild><Link to="/pricing">See Pricing</Link></Button>
      </div>
    </PageHeader>

    <section className="py-16 border-y border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-display text-3xl md:text-4xl mb-5">Start With Your Trade, Service Area and Goals</h2>
        <p className="text-muted-foreground leading-relaxed">A renovation company needs to explain its project process. A steel stud crew needs to show commercial scope and capacity. A snow contractor needs to communicate seasonal availability. We shape the work around your business and the customers you want to reach.</p>
      </div>
    </section>

    <section className="py-20 border-y border-border bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            See It <span className="text-primary">In Action</span>
          </h2>
        </div>
        <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/VQxS3STSLHA"
            title="Industry Army Contractors"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>

    <section className="py-20 gradient-tactical border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Why Contractors <span className="text-primary">Choose IAM</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-7 rounded-lg bg-card border border-border hover:border-primary/40 hover:border-glow transition-all"
            >
              <r.icon className="w-9 h-9 text-primary mb-4" />
              <h3 className="font-display text-xl text-foreground mb-2">{r.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{r.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <section className="py-16 border-y border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-display text-3xl md:text-4xl mb-8">Real Work Behind the Network</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <article><h3 className="font-display text-2xl mb-3">Steelstud to Southpointe Academy</h3><p className="text-muted-foreground leading-relaxed">A Southpointe Academy school project enquiry came through Steelstud.ca and was referred to Rambo Wall &amp; Ceiling, which was awarded the project. This documents a referral and awarded job; the originating search query is not established.</p></article>
          <article><h3 className="font-display text-2xl mb-3">Years of Work With LSFencing</h3><p className="text-muted-foreground leading-relaxed">Our experience includes years of SEO work for LSFencing and specialist websites such as BarrierGates.ca. Industry resources grow through useful contributions from businesses sharing practical knowledge and real projects.</p></article>
        </div>
        <p className="text-muted-foreground mt-8">Membership does not guarantee rankings, enquiries or awarded contracts. Outcomes depend on the business, market, work completed and follow-up.</p>
        <h2 className="font-display text-3xl mt-12 mb-6">Choose Your Starting Point</h2>
        <div className="space-y-5 text-muted-foreground">
          <p><strong className="text-foreground">One-hub registration: $10 USD/year.</strong> <Link className="text-primary underline" to="/contact?tier=directory">Ask about registering your business</Link>.</p>
          <p><strong className="text-foreground">City-page partnership: fit review and separate pricing.</strong> For businesses and creators contributing projects and local expertise. <Link className="text-primary underline" to="/apply/contractors">Apply for a partnership</Link>.</p>
          <p><strong className="text-foreground">Website and marketing services: separately scoped.</strong> Agree on deliverables and price before starting. <Link className="text-primary underline" to="/seo-packages">Explore SEO services</Link>.</p>
        </div>
        <h3 className="font-display text-2xl mt-10 mb-4">What to Bring</h3>
        <p className="text-muted-foreground">Your website, trade, service area, preferred job types and capacity. Bring project examples and any search or enquiry records you have so we can identify gaps and agree on the first step.</p>
      </div>
    </section>
    <ContactSection source="contractor-marketing" title="Tell Us About Your Contracting Business" intro="Share your trade, city, website and the work you want more of. Tell us whether you need marketing support, one-hub registration or a city-page partnership." />
  </Layout>
);

export default Contractors;
