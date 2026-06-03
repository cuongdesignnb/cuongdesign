"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { Save, CheckCircle, ShieldAlert } from "lucide-react";

interface AdminSettingsFormProps {
  initialSettings: Record<string, string>;
}

export default function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  const [settings, setSettings] = useState({
    theme_primary_color: initialSettings.theme_primary_color || "#ec4899",
    theme_secondary_color: initialSettings.theme_secondary_color || "#8b5cf6",
    smtp_host: initialSettings.smtp_host || "",
    smtp_port: initialSettings.smtp_port || "587",
    smtp_user: initialSettings.smtp_user || "",
    smtp_pass: initialSettings.smtp_pass || "",
    smtp_from: initialSettings.smtp_from || "",
    admin_receive_email: initialSettings.admin_receive_email || "",
    telegram_bot_token: initialSettings.telegram_bot_token || "",
    telegram_chat_id: initialSettings.telegram_chat_id || "",
    ai_chat_prompt: initialSettings.ai_chat_prompt || "",
    ai_writer_prompt: initialSettings.ai_writer_prompt || "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    const result = await updateSettings(settings);

    if (result.success) {
      setStatus("success");
      
      // Dynamically apply primary color change to the root variables for immediate client preview
      document.documentElement.style.setProperty("--primary-color", settings.theme_primary_color);
      document.documentElement.style.setProperty("--secondary-color", settings.theme_secondary_color);
    } else {
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 text-left">
      {/* Visual Settings */}
      <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 space-y-4">
        <h3 className="text-lg font-bold text-white">1. Cấu hình Màu sắc Theme</h3>
        <p className="text-xs text-gray-500">Màu sắc chủ đạo (Accent colors) của website chính và trang quản trị.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-400 block font-medium">Màu chủ đạo chính (Primary color HEX)</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                name="theme_primary_color"
                value={settings.theme_primary_color}
                onChange={handleChange}
                className="w-10 h-10 border-0 rounded bg-transparent cursor-pointer"
              />
              <input
                type="text"
                name="theme_primary_color"
                value={settings.theme_primary_color}
                onChange={handleChange}
                placeholder="#ec4899"
                className="glass-input px-4 py-2 text-sm grow uppercase font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400 block font-medium">Màu chủ đạo phụ (Secondary color HEX)</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                name="theme_secondary_color"
                value={settings.theme_secondary_color}
                onChange={handleChange}
                className="w-10 h-10 border-0 rounded bg-transparent cursor-pointer"
              />
              <input
                type="text"
                name="theme_secondary_color"
                value={settings.theme_secondary_color}
                onChange={handleChange}
                placeholder="#8b5cf6"
                className="glass-input px-4 py-2 text-sm grow uppercase font-mono"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* SMTP Email Settings */}
      <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 space-y-4">
        <h3 className="text-lg font-bold text-white">2. Cấu hình Email SMTP & Báo cáo</h3>
        <p className="text-xs text-gray-500">Thiết lập SMTP để gửi email đơn hàng, hóa đơn và email nhận source code.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">SMTP Host</label>
            <input
              type="text"
              name="smtp_host"
              value={settings.smtp_host}
              onChange={handleChange}
              placeholder="smtp.gmail.com"
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">SMTP Port</label>
            <input
              type="text"
              name="smtp_port"
              value={settings.smtp_port}
              onChange={handleChange}
              placeholder="587"
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">Email người gửi (SMTP From)</label>
            <input
              type="text"
              name="smtp_from"
              value={settings.smtp_from}
              onChange={handleChange}
              placeholder='"CUONG DESIGN" <noreply@cuongdesign.com>'
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">SMTP Username</label>
            <input
              type="text"
              name="smtp_user"
              value={settings.smtp_user}
              onChange={handleChange}
              placeholder="user@gmail.com"
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">SMTP Password</label>
            <input
              type="password"
              name="smtp_pass"
              value={settings.smtp_pass}
              onChange={handleChange}
              placeholder="••••••••"
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400 block font-medium">Email Admin nhận thông báo *</label>
          <input
            type="email"
            name="admin_receive_email"
            value={settings.admin_receive_email}
            onChange={handleChange}
            placeholder="admin@cuongdesign.com"
            className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
          />
        </div>
      </GlassCard>

      {/* Telegram Webhook Settings */}
      <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 space-y-4">
        <h3 className="text-lg font-bold text-white">3. Cấu hình Telegram Notification</h3>
        <p className="text-xs text-gray-500">Nhận thông báo đơn hàng và liên hệ tức thì qua Telegram Bot.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">Telegram Bot Token</label>
            <input
              type="text"
              name="telegram_bot_token"
              value={settings.telegram_bot_token}
              onChange={handleChange}
              placeholder="7328919:AAEfK..."
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">Telegram Chat ID</label>
            <input
              type="text"
              name="telegram_chat_id"
              value={settings.telegram_chat_id}
              onChange={handleChange}
              placeholder="-1001898762"
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>
      </GlassCard>

      {/* AI Chatbot & Writer Settings */}
      <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 space-y-4">
        <h3 className="text-lg font-bold text-white">4. Cấu hình AI Copilot (Chatbot & Viết bài)</h3>
        <p className="text-xs text-gray-500">Thiết lập System Prompt để định hướng câu trả lời của AI Chatbot và AI Writer.</p>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">AI Chatbot System Prompt (Tư vấn khách hàng)</label>
            <textarea
              name="ai_chat_prompt"
              value={settings.ai_chat_prompt}
              onChange={handleChange}
              placeholder="Bạn là trợ lý ảo AI của Cuong Design. Hãy tư vấn nhiệt tình về các dịch vụ: thiết kế UI/UX, lập trình web (Next.js, React), landing page..."
              rows={4}
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none resize-y"
            />
            <span className="text-[10px] text-gray-500 block">Dùng để hướng dẫn AI khi chat với khách hàng trên landing page.</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">AI Writer System Prompt (Tạo bài viết SEO)</label>
            <textarea
              name="ai_writer_prompt"
              value={settings.ai_writer_prompt}
              onChange={handleChange}
              placeholder="Bạn là chuyên gia Content SEO hàng đầu. Viết bài viết blog dài tối thiểu 1500 từ..."
              rows={4}
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none resize-y"
            />
            <span className="text-[10px] text-gray-500 block">Dùng để ghi đè prompt mặc định khi sinh bài viết tự động.</span>
          </div>
        </div>
      </GlassCard>

      {/* Save Button & Feedback status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {status === "success" && (
            <div className="flex items-center space-x-2 text-green-400 font-semibold text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Đã lưu cấu hình thành công!</span>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center space-x-2 text-red-400 font-semibold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>Có lỗi phát sinh khi lưu cấu hình.</span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-8"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Đang lưu..." : "Lưu tất cả Cài đặt"}</span>
        </Button>
      </div>

    </form>
  );
}
