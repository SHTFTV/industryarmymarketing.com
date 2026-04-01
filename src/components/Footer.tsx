const Footer = () => {
  return (
    <footer className="py-8 border-t border-border bg-background">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl text-primary text-glow">IAM</span>
          <span className="text-muted-foreground text-sm">© {new Date().getFullYear()} Industry Army Marketing</span>
        </div>
        <p className="text-muted-foreground text-sm">The Leaders in the SEO Industry</p>
      </div>
    </footer>
  );
};

export default Footer;
