"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Terminal, Lock, Mail, AlertTriangle, ArrowRight } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email hoặc mật khẩu không chính xác.");
      } else {
        // Redirect directly to admin dashboard
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration orbs */}
      <div className="glow-orb w-96 h-96 bg-purple-600/10 top-1/4 left-1/4" style={{ filter: "blur(120px)" }} />
      <div className="glow-orb w-96 h-96 bg-pink-500/10 bottom-1/4 right-1/4" style={{ filter: "blur(120px)" }} />

      <div className="w-full max-w-md relative z-10 space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-pink-500 shadow-xl">
            <Terminal className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
            CUONG <GradientText>DEV</GradientText>
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Hệ thống quản trị và đăng nhập</p>
        </div>

        {/* Card Form */}
        <GlassCard className="p-8 border-white/10 bg-[#0d0b21]/80 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 block font-medium">Email quản trị *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cuongdesign.com"
                  className="glass-input w-full pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 block font-medium">Mật khẩu *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 pt-3 mt-2"
            >
              <span>{loading ? "Đang đăng nhập..." : "Đăng nhập hệ thống"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </GlassCard>

        {/* Back Link */}
        <a href="/" className="inline-block text-xs text-gray-500 hover:text-white transition-colors">
          ← Quay về trang chủ Website
        </a>
      </div>
    </div>
  );
}
