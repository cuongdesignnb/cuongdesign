"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Eye, X, Send, CheckCircle2, CreditCard } from "lucide-react";
import { products as staticProducts, ProductItem } from "@/data/products";
import { formatVND } from "@/lib/utils";
import { createOrder } from "@/app/actions/orders";
import GlassCard from "../ui/GlassCard";
import AnimatedSectionHeading from "../motion/AnimatedSectionHeading";
import Stagger from "../motion/Stagger";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { fadeUpVariants, hoverDepthVariants, motionTokens } from "@/lib/motion";

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

export default function DigitalProductsSection({ initialProducts }: { initialProducts?: any[] }) {
  const products = initialProducts || staticProducts;
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  // Paid product checkout states
  const [checkoutProduct, setCheckoutProduct] = useState<any | null>(null);
  const [checkoutFormData, setCheckoutFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  const openCheckoutModal = (product: any) => {
    setCheckoutProduct(product);
    setCheckoutFormData({ name: "", email: "", phone: "" });
  };

  const handleCheckoutInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCheckoutFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct) return;
    setCheckoutSubmitting(true);

    try {
      const res = await createOrder({
        productId: checkoutProduct.id,
        customerName: checkoutFormData.name,
        customerEmail: checkoutFormData.email,
        customerPhone: checkoutFormData.phone || undefined,
      });

      if (res.success && res.orderId) {
        setCheckoutProduct(null);
        router.push(`/thanh-toan/${res.orderId}`);
      } else {
        alert("Lỗi tạo đơn hàng: " + (res.error || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi hệ thống khi thanh toán.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const openContactModal = (product: ProductItem) => {
    setSelectedProduct(product);
    setSubmitSuccess(false);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `Yêu cầu nhận source code: ${selectedProduct.title}`,
          message: formData.message || `Yêu cầu nhận source code miễn phí cho sản phẩm "${selectedProduct.title}".`,
          productId: selectedProduct.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
      } else {
        alert("Lỗi: " + (data.error || "Gửi yêu cầu không thành công"));
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi kết nối mạng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="products" className="py-24 relative overflow-hidden bg-[#030014]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSectionHeading
          title="Sản phẩm số / Digital Products"
          subtitle="Mua mã nguồn hoặc tải các template/UI kit chất lượng để triển khai dự án nhanh chóng."
        />

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" stagger={0.12}>
          {products.map((product) => (
            <motion.div key={product.id} variants={fadeUpVariants}>
              <motion.div
                initial="rest"
                whileHover="hover"
                variants={hoverDepthVariants}
                className="h-full"
              >
                <GlassCard
                  className="group flex flex-col h-full overflow-hidden p-0 border border-white/5 bg-[#0d0b21]/45 hover:border-pink-500/25 transition-colors duration-300"
                >
                  {/* Product Mockup Representation */}
                  <Link href={`/san-pham/${product.slug}`} className="block relative w-full aspect-video border-b border-white/5 overflow-hidden group/img">
                    {product.coverImage ? (
                      <img 
                        src={product.coverImage} 
                        alt={product.title} 
                        className="w-full h-full object-cover object-top transition-all duration-[3s] ease-in-out group-hover/img:duration-[8s] group-hover/img:object-bottom" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-950/20 to-indigo-950/40 flex items-center justify-center">
                        <div className="w-[70%] h-[70%] bg-gradient-to-br from-indigo-950/60 to-purple-900/50 border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col items-center justify-center space-y-2">
                          <ShoppingBag className="w-8 h-8 text-pink-500/60" />
                          <span className="font-mono text-[9px] text-gray-500 select-none">
                            {product.slug}.zip
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                      <Badge variant="primary">{product.type}</Badge>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <span className="px-4 py-2 rounded-xl bg-pink-500/90 text-white font-bold text-xs shadow-lg backdrop-blur-sm transform translate-y-2 group-hover/img:translate-y-0 transition-all duration-300">
                        Xem chi tiết
                      </span>
                    </div>
                  </Link>

                  {/* Info Area */}
                  <div className="p-6 flex flex-col grow space-y-4">
                    <div className="grow">
                      <Link href={`/san-pham/${product.slug}`}>
                        <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors duration-200">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-xs md:text-sm mt-2 leading-relaxed line-clamp-3">
                        {product.descriptionVi || product.description}
                      </p>
                    </div>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {product.techStack.map((tech: string) => (
                        <span key={tech} className="text-[10px] bg-white/5 border border-white/5 rounded-md px-2 py-0.5 text-gray-300 font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Price and Action Row */}
                    <div className="pt-3 border-t border-white/5 flex flex-col gap-3 mt-auto w-full">
                      {/* Price & Demo Link Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Giá / Price</span>
                          <span className="text-base font-extrabold text-white">
                            {product.price === 0 ? (
                              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-bold uppercase tracking-wider text-xs sm:text-sm">
                                Miễn phí / Free
                              </span>
                            ) : (
                              formatVND(product.price)
                            )}
                          </span>
                        </div>

                        {product.demoUrl && (
                          <Link 
                            href={`/preview/${product.slug}`} 
                            target="_blank" 
                            className="inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition-all duration-300 px-3 py-1.5 text-xs border border-white/10 text-white bg-white/5 hover:bg-white/10 hover:border-pink-500/50 hover:shadow-[0_0_12px_rgba(236,72,153,0.15)] cursor-pointer"
                            title="Xem Demo"
                          >
                            <Eye className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                            <span>Xem Demo</span>
                          </Link>
                        )}
                      </div>

                      {/* Core Action Buttons Row */}
                      <div className="grid grid-cols-2 gap-2.5 w-full">
                        <Link href={`/san-pham/${product.slug}`} className="w-full">
                          <button className="w-full inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 px-3 py-2.5 text-xs border border-white/10 text-white bg-white/5 hover:bg-white/10 hover:border-pink-500/50 hover:shadow-[0_0_12px_rgba(236,72,153,0.15)] cursor-pointer text-center">
                            Chi tiết
                          </button>
                        </Link>

                        {product.price === 0 ? (
                          <button
                            onClick={() => openContactModal(product)}
                            className="w-full inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 px-3 py-2.5 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 cursor-pointer text-center"
                          >
                            Nhận code
                          </button>
                        ) : (
                          <button
                            onClick={() => openCheckoutModal(product)}
                            className="w-full inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 px-3 py-2.5 text-xs bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(236,72,153,0.25)] hover:shadow-[0_4px_22px_rgba(236,72,153,0.45)] hover:scale-[1.02] cursor-pointer text-center"
                          >
                            Mua ngay
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          ))}
        </Stagger>
      </div>

      {/* Free Product / Contact Form Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              className="relative w-full max-w-lg overflow-hidden glass-card border border-white/10 p-8 flex flex-col space-y-6 bg-[#0c0a21]/95"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Title */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Yêu cầu nhận mã nguồn</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Nhập thông tin bên dưới để nhận source code miễn phí:{" "}
                  <strong className="text-pink-400">{selectedProduct.title}</strong>
                </p>
              </div>

              {submitSuccess ? (
                <motion.div
                  className="flex flex-col items-center justify-center text-center py-8 space-y-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.1 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-400" />
                  </motion.div>
                  <h4 className="text-lg font-semibold text-white">Gửi yêu cầu thành công!</h4>
                  <p className="text-sm text-gray-400 max-w-sm">
                    Cảm ơn bạn đã đăng ký. Cường sẽ liên hệ trực tiếp với bạn qua Zalo/Email để hỗ trợ cài đặt và gửi mã nguồn sớm nhất.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                    Đóng cửa sổ
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 block font-medium">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="client@gmail.com"
                        className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 block font-medium">Số điện thoại / Zalo *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="0912345678"
                        className="glass-input w-full px-4 py-2 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-medium">Ghi chú yêu cầu (Tùy chọn)</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Nhập yêu cầu hoặc câu hỏi cụ thể của bạn..."
                      className="glass-input w-full px-4 py-2 text-sm focus:outline-none resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 pt-3"
                  >
                    {isSubmitting ? (
                      <span>Đang gửi...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi yêu cầu nhận Code</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paid Product Checkout Info Modal */}
      <AnimatePresence>
        {checkoutProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setCheckoutProduct(null)}
          >
            <motion.div
              className="relative w-full max-w-lg overflow-hidden glass-card border border-white/10 p-8 flex flex-col space-y-6 bg-[#0c0a21]/95 rounded-2xl"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setCheckoutProduct(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Title */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-pink-500" />
                  <span>Thông tin thanh toán</span>
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Vui lòng điền thông tin để nhận đường dẫn tải mã nguồn{" "}
                  <strong className="text-pink-400">{checkoutProduct.title}</strong> sau khi hoàn tất thanh toán.
                </p>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={checkoutFormData.name}
                    onChange={handleCheckoutInputChange}
                    required
                    placeholder="Nguyễn Văn A"
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-medium">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={checkoutFormData.email}
                      onChange={handleCheckoutInputChange}
                      required
                      placeholder="client@gmail.com"
                      className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-medium">Số điện thoại / Zalo (Tùy chọn)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={checkoutFormData.phone}
                      onChange={handleCheckoutInputChange}
                      placeholder="0912345678"
                      className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Tổng thanh toán:</span>
                    <span className="text-lg font-bold text-pink-400">
                      {formatVND(checkoutProduct.salePrice !== null && checkoutProduct.salePrice !== undefined ? checkoutProduct.salePrice : checkoutProduct.price)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={checkoutSubmitting}
                  className="w-full flex items-center justify-center gap-2 pt-3 bg-pink-600 hover:bg-pink-500 font-bold"
                >
                  {checkoutSubmitting ? (
                    <span>Đang xử lý đơn hàng...</span>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Xác nhận & Lấy mã VietQR</span>
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
