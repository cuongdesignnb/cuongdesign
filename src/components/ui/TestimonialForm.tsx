"use client";

import React, { useState } from "react";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { createTestimonial } from "@/app/actions/testimonials";
import Button from "./Button";
import GlassCard from "./GlassCard";

export default function TestimonialForm() {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    quote: "",
  });
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await createTestimonial({
        ...formData,
        rating,
      });

      if (res.success) {
        setMessage({ type: "success", text: res.message || "" });
        setFormData({ name: "", role: "", company: "", quote: "" });
        setRating(5);
      } else {
        setMessage({ type: "error", text: res.error || "Gửi phản hồi thất bại." });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: "Lỗi hệ thống khi gửi phản hồi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-6 md:p-8 border-white/5 bg-[#0a0822]/70 text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span>Gửi phản hồi của bạn</span>
      </h3>
      <p className="text-xs text-gray-400 mb-6">
        Chia sẻ trải nghiệm hợp tác của bạn cùng Cường để giúp cải thiện dịch vụ ngày một tốt hơn.
      </p>

      {message?.type === "success" ? (
        <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
          <h4 className="text-base font-bold text-white">Gửi thành công!</h4>
          <p className="text-xs text-gray-400 max-w-xs">
            {message.text}
          </p>
          <Button variant="outline" size="sm" onClick={() => setMessage(null)}>
            Gửi thêm đánh giá khác
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Stars Selector */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">Đánh giá số sao *</label>
            <div className="flex items-center space-x-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="focus:outline-none transition-transform duration-100 hover:scale-125 cursor-pointer"
                >
                  <Star 
                    className={`w-6 h-6 ${
                      star <= (hoverRating ?? rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 block font-medium">Họ và tên *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Nguyễn Văn A"
                className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 block font-medium">Vai trò / Chức vụ *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                placeholder="CEO, Lead Developer..."
                className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">Tên công ty / Tổ chức (Tùy chọn)</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Google, Tech Solution,..."
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 block font-medium">Nội dung nhận xét *</label>
            <textarea
              name="quote"
              value={formData.quote}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Hãy chia sẻ nhận xét chi tiết của bạn về chất lượng dịch vụ, quy trình làm việc, thái độ hợp tác..."
              className="glass-input w-full px-4 py-2 text-sm focus:outline-none resize-none"
            />
          </div>

          {message?.type === "error" && (
            <div className="text-xs text-red-400 font-semibold py-1">
              ⚠️ {message.text}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 pt-2.5 bg-pink-600 hover:bg-pink-500 font-bold"
          >
            {isSubmitting ? (
              <span>Đang gửi đánh giá...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi đánh giá duyệt</span>
              </>
            )}
          </Button>
        </form>
      )}
    </GlassCard>
  );
}
