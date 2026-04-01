import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  { icon: Phone, label: "Phone", value: "1-604-761-1518" },
  { icon: Mail, label: "Email", value: "colin@industryarmymarketing.com" },
  { icon: MapPin, label: "Address", value: "3645 Kingsway, Vancouver, BC V5R 5M1, Canada" },
];

const ContactSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary uppercase tracking-[0.3em] text-sm font-semibold mb-3">Get In Touch</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">Contact Us</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <p className="text-muted-foreground leading-relaxed">
              Have a question about our services? Ready to claim your territory? 
              Fill out the form and our SEO experts will contact you soon.
            </p>
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-semibold text-sm">{item.label}</p>
                  <p className="text-muted-foreground text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-card border-border focus:border-primary"
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card border-border focus:border-primary"
              />
            </div>
            <Textarea
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              className="bg-card border-border focus:border-primary resize-none"
            />
            <Button variant="hero" size="lg" type="submit" className="self-end">
              Send Message
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
