"use client";

import { useState, useEffect } from "react";
import { Terminal, Menu, X, Moon, Sun, Send, ChevronDown } from "lucide-react";
import Button from "../ui/Button";
import GradientText from "../ui/GradientText";

interface MenuItem {
  id: string;
  label: string;
  href: string | null;
  children?: MenuItem[];
}

const defaultFallbackMenu: MenuItem[] = [
  { id: "1", label: "Trang chủ", href: "/" },
  {
    id: "2",
    label: "Giới thiệu",
    href: null,
    children: [
      { id: "2-1", label: "Hồ sơ cá nhân", href: "/gioi-thieu" },
      { id: "2-2", label: "Quy trình làm việc", href: "/quy-trinh" },
      { id: "2-3", label: "Kỹ năng & Công nghệ", href: "/ky-nang" },
    ]
  },
  {
    id: "3",
    label: "Chuyên môn",
    href: null,
    children: [
      { id: "3-1", label: "Dịch vụ cung cấp", href: "/dich-vu" },
      { id: "3-2", label: "Dự án thực tế", href: "/du-an" },
    ]
  },
  {
    id: "4",
    label: "Cửa hàng & Tin tức",
    href: null,
    children: [
      { id: "4-1", label: "Sản phẩm số", href: "/san-pham" },
      { id: "4-2", label: "Bài viết & Blog", href: "/bai-viet" },
    ]
  },
  { id: "5", label: "Đánh giá", href: "/danh-gia" },
  { id: "6", label: "Liên hệ & FAQ", href: "/lien-he" }
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navItems, setNavItems] = useState<MenuItem[]>(defaultFallbackMenu);

  // Fetch dynamic menu from DB
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/navigation");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.items && data.items.length > 0) {
            setNavItems(data.items);
          }
        }
      } catch (err) {
        console.error("Lỗi tải menu điều hướng:", err);
      }
    }
    loadMenu();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#030014]/80 backdrop-blur-md py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/#home" className="flex items-center space-x-2 text-white font-bold text-lg md:text-xl">
            <Terminal className="w-5 h-5 text-pink-500" />
            <span>
              CUONG <GradientText>DESIGN</GradientText>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 items-center">
            {navItems.map((item) => (
              <div key={item.id} className="relative group py-2">
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                  >
                    {item.label}
                  </a>
                ) : (
                  <>
                    <button className="text-gray-300 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer focus:outline-none">
                      <span>{item.label}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-pink-400 group-hover:rotate-180 transition-transform duration-200" />
                    </button>

                    {/* Dropdown Box */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 border border-white/5 bg-[#0a0822]/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 flex flex-col space-y-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:block">
                      {item.children?.map((child) => (
                        <a
                          key={child.id}
                          href={child.href || "#"}
                          className="text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <Moon className="w-5 h-5" />
            </button>
            <a href="/#contact">
              <Button size="sm" variant="primary" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>Thuê tôi / Hire Me</span>
              </Button>
            </a>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center space-x-4">
            <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <Moon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#030014] border-b border-white/10 px-4 pt-2 pb-6 space-y-3 max-h-[75vh] overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.id} className="space-y-1">
              {item.href ? (
                <a
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 text-left"
                >
                  {item.label}
                </a>
              ) : (
                <div className="space-y-1 text-left">
                  <div className="px-3 py-1.5 text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
                    {item.label}
                  </div>
                  <div className="pl-4 space-y-1 border-l border-white/5 ml-3">
                    {item.children?.map((child) => (
                      <a
                        key={child.id}
                        href={child.href || "#"}
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white text-left hover:bg-white/5"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="pt-4 px-3">
            <a href="/#contact" onClick={() => setIsOpen(false)} className="block w-full">
              <Button variant="primary" className="w-full justify-center flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>Thuê tôi / Hire Me</span>
              </Button>
            </a>
          </div>
        </div>
      )}
      
      {/* Smooth Gradient Border Bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 via-white/10 via-purple-500/20 to-transparent transition-opacity duration-300 pointer-events-none ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </header>
  );
}
