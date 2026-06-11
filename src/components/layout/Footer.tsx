"use client";

import { Terminal, Send } from "lucide-react";
import { siteConfig } from "@/data/site";
import GradientText from "../ui/GradientText";
import { useSettings } from "@/components/ui/SettingsContext";

export default function Footer() {
  const settings = useSettings();
  
  const email = settings.contact_email || siteConfig.contact.email;
  const phone = settings.contact_phone || siteConfig.contact.phone;
  const zalo = settings.contact_zalo || siteConfig.contact.zalo;
  const location = settings.contact_location || siteConfig.contact.location;
  const facebook = settings.contact_facebook || siteConfig.contact.facebook;
  const github = settings.contact_github || siteConfig.contact.github;

  return (
    <footer className="bg-[#030014] border-t border-white/5 pt-16 pb-8 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Logo & Intro */}
          <div className="lg:col-span-2 space-y-6">
            <a href="#home" className="flex items-center space-x-2 text-white font-bold text-xl">
              <Terminal className="w-6 h-6 text-pink-500" />
              <span>
                CUONG <GradientText>DEV</GradientText>
              </span>
            </a>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              Freelancer Developer chuyên thiết kế giao diện UI/UX và lập trình website, web app hiện đại, chuẩn SEO, tối ưu tốc độ và chuyển đổi bán hàng cao.
            </p>
            <div className="flex space-x-4">
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white p-2 bg-white/5 hover:bg-pink-500/20 hover:text-pink-500 rounded-lg transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href={github}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white p-2 bg-white/5 hover:bg-pink-500/20 hover:text-pink-500 rounded-lg transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href={zalo}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white p-2 bg-white/5 hover:bg-pink-500/20 hover:text-pink-500 rounded-lg transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Liên kết nhanh</h4>
            <ul className="space-y-2.5">
              {siteConfig.navLinks.slice(0, 5).map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column Services */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Dịch vụ chính</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="/#services" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Thiết kế UI/UX Website
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Lập trình Website Doanh nghiệp
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Landing Page Chuyển đổi cao
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Tối ưu SEO & Tốc độ
                </a>
              </li>
            </ul>
          </div>

          {/* Column Contact */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <span className="block text-white font-medium text-xs uppercase text-gray-500">Email</span>
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </li>
              <li>
                <span className="block text-white font-medium text-xs uppercase text-gray-500">Zalo / SĐT</span>
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </li>
              <li>
                <span className="block text-white font-medium text-xs uppercase text-gray-500">Vị trí</span>
                <span>{location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription Row */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h5 className="text-white font-medium text-sm">Nhận thông tin mới nhất</h5>
            <p className="text-gray-500 text-xs mt-1">Đăng ký để nhận thông báo về sản phẩm mới và ưu đãi đặc biệt.</p>
          </div>
          <form className="flex w-full md:w-auto max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email của bạn..."
              className="glass-input px-4 py-2 text-sm grow w-full md:w-64 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-white/5 border border-white/10 hover:bg-pink-500/20 hover:text-pink-500 hover:border-pink-500/30 p-2.5 rounded-xl text-white transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Cuong Design. All rights reserved.</p>
          <p>
            Made with <span className="text-pink-500">❤️</span> by Cuong Design
          </p>
        </div>
      </div>
    </footer>
  );
}
