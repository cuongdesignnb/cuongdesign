import { GitBranch, Globe, MessageCircle, Send, Terminal } from "lucide-react";
import GradientText from "../ui/GradientText";
import { getPublishedContent } from "@/lib/content/get-content";
import { getPublishedServices } from "@/lib/content/get-service-content";
import { prisma } from "@/lib/db";

export default async function Footer() {
  const [global, footer, services] = await Promise.all([
    getPublishedContent("global"),
    getPublishedContent("footer"),
    getPublishedServices(),
  ]);
  let menuItems: { id: string; label: string; href: string | null }[] = [];
  try {
    menuItems = await prisma.menuItem.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      select: { id: true, label: true, href: true },
    });
  } catch (error) {
    console.error("[Footer] Could not load menu.", error);
  }

  return (
    <footer className="bg-[#030014] border-t border-white/5 pt-16 pb-8 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <a href="#home" className="flex items-center space-x-2 text-white font-bold text-xl">
              <Terminal className="w-6 h-6 text-pink-500" />
              <span>{global.brand.name.split(" ")[0]} <GradientText>{global.brand.name.split(" ").slice(1).join(" ") || "DESIGN"}</GradientText></span>
            </a>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">{footer.description}</p>
            <div className="flex space-x-4">
              {[
                { href: global.social.facebook, label: "Facebook", icon: Globe },
                { href: global.social.github, label: "GitHub", icon: GitBranch },
                { href: global.contact.zalo, label: "Zalo", icon: MessageCircle },
              ].filter((item) => item.href).map(({ href, label, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-gray-400 hover:text-white p-2 bg-white/5 hover:bg-pink-500/20 hover:text-pink-500 rounded-lg transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">{footer.columnTitles.navigation}</h2>
            <ul className="space-y-2.5">
              {menuItems.filter((item) => item.href).slice(0, 5).map((link) => (
                <li key={link.id}><a href={link.href!} className="text-gray-400 hover:text-white text-sm transition-colors duration-200">{link.label}</a></li>
              ))}
              {(footer.customLinks as { label?: string; url?: string; enabled?: boolean }[]).filter((item) => item.enabled !== false && item.url).map((link) => (
                <li key={`${link.label}-${link.url}`}><a href={link.url} className="text-gray-400 hover:text-white text-sm transition-colors duration-200">{link.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">{footer.columnTitles.services}</h2>
            <ul className="space-y-2.5">
              {services.slice(0, 4).map((service) => (
                <li key={service.id}><a href={`/dich-vu/${service.slug}`} className="text-gray-400 hover:text-white text-sm transition-colors duration-200">{service.title}</a></li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">{footer.columnTitles.contact}</h2>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><span className="block font-medium text-xs uppercase text-gray-500">Email</span><a href={`mailto:${global.contact.email}`} className="hover:text-white transition-colors">{global.contact.email}</a></li>
              <li><span className="block font-medium text-xs uppercase text-gray-500">Zalo / SĐT</span><a href={`tel:${global.contact.phone}`} className="hover:text-white transition-colors">{global.contact.phone}</a></li>
              <li><span className="block font-medium text-xs uppercase text-gray-500">Vị trí</span><span>{global.contact.address}</span></li>
            </ul>
          </div>
        </div>

        {footer.newsletter.enabled && (
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left"><h2 className="text-white font-medium text-sm">{footer.newsletter.title}</h2><p className="text-gray-500 text-xs mt-1">{footer.newsletter.description}</p></div>
            <div className="flex w-full md:w-auto max-w-md gap-2">
              <input type="email" placeholder={footer.newsletter.placeholder} className="glass-input px-4 py-2 text-sm grow w-full md:w-64 focus:outline-none" />
              <button type="button" aria-label={footer.newsletter.buttonLabel} title={footer.newsletter.buttonLabel} className="bg-white/5 border border-white/10 hover:bg-pink-500/20 hover:text-pink-500 hover:border-pink-500/30 p-2.5 rounded-xl text-white transition-all cursor-pointer"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>{footer.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
          <p>{footer.credit}</p>
        </div>
      </div>
    </footer>
  );
}
