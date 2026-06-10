import { Logo } from "./Logo";
import { Github, Twitter, Linkedin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 mt-24">
      <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Logo />
          <p className="text-sm text-muted-foreground mt-4 max-w-xs">
            African Talent. Global Standards. Zero Barriers.
          </p>
          <div className="flex gap-3 mt-4 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors"><Twitter className="h-4 w-4" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Github className="h-4 w-4" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
        {[
          { title: "Product", links: ["Features", "Pricing", "Security", "Roadmap"] },
          { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
          { title: "Legal", links: ["Terms", "Privacy", "Cookies", "Escrow"] },
        ].map((c) => (
          <div key={c.title}>
            <h4 className="font-display font-semibold text-sm mb-3">{c.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {c.links.map((l) => (
                <li key={l}><a href="#" className="hover:text-foreground transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} DevPay Africa. Built for the continent, made for the world.
      </div>
    </footer>
  );
}
