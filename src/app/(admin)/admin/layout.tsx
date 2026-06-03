import React from "react";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingBag,
  CreditCard,
  Settings,
  LogOut,
  Mail,
  FileText,
  MessageSquare,
  Sparkles,
  Menu,
  Star,
  MessageSquarePlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import GradientText from "@/components/ui/GradientText";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  // Route security check just in case middleware is bypassed
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/" });
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Quản lý Dự án", href: "/admin/projects", icon: FolderKanban },
    { label: "Quản lý Sản phẩm", href: "/admin/products", icon: ShoppingBag },
    { label: "Đơn hàng (SePay)", href: "/admin/orders", icon: CreditCard },
    { label: "AI Auto Blog", href: "/admin/blog", icon: Sparkles },
    { label: "Quản lý Bài viết", href: "/admin/blog/posts", icon: FileText },
    { label: "Cấu hình Menu", href: "/admin/menu", icon: Menu },
    { label: "Hộp thư Liên hệ", href: "/admin/contacts", icon: Mail },
    { label: "Duyệt Đánh giá", href: "/admin/reviews", icon: Star },
    { label: "Đánh giá Khách hàng", href: "/admin/testimonials", icon: MessageSquarePlus },
    { label: "Trang Chính sách", href: "/admin/pages", icon: FileText },
    { label: "Trò chuyện Live", href: "/admin/chats", icon: MessageSquare },
    { label: "Quản lý Users", href: "/admin/users", icon: Users },
    { label: "Cấu hình Hệ thống", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#060417] text-gray-200 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 border-r border-white/5 bg-[#0a0822] flex flex-col justify-between shrink-0">
        <div className="p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-white font-bold text-lg">
            <span className="text-pink-500 font-mono font-bold">&lt;/&gt;</span>
            <span>
              CUONG <GradientText>ADMIN</GradientText>
            </span>
          </Link>

          {/* Nav Items */}
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Card & Logout */}
        <div className="p-6 border-t border-white/5 bg-black/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center font-bold text-pink-400 text-xs">
              {session.user?.name?.[0] || "A"}
            </div>
            <div className="overflow-hidden">
              <h5 className="text-xs font-bold text-white truncate max-w-[120px]">{session.user?.name || "Admin"}</h5>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Quản trị viên</span>
            </div>
          </div>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="text-gray-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="grow p-6 lg:p-10 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
