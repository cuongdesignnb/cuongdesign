import { prisma } from "@/lib/db";
import { formatVND } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { ShoppingBag, DollarSign, Mail, Users, ArrowUpRight, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  // Fetch stats from DB
  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    recentContacts,
    recentOrders,
    usersCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { product: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const revenueAggregate = await prisma.order.aggregate({
    where: { status: "COMPLETED" },
    _sum: { amount: true },
  });

  const totalRevenue = revenueAggregate._sum.amount || 0;

  const kpis = [
    {
      label: "Tổng doanh thu",
      value: formatVND(totalRevenue),
      desc: "Từ đơn hàng hoàn thành",
      icon: DollarSign,
      color: "text-green-400 bg-green-500/10",
    },
    {
      label: "Tổng số đơn hàng",
      value: totalOrders.toString(),
      desc: `${completedOrders} đã duyệt, ${pendingOrders} chờ`,
      icon: ShoppingBag,
      color: "text-pink-400 bg-pink-500/10",
    },
    {
      label: "Hộp thư liên hệ",
      value: recentContacts.length.toString(),
      desc: "Tin nhắn yêu cầu / tư vấn",
      icon: Mail,
      color: "text-purple-400 bg-purple-500/10",
    },
    {
      label: "Tài khoản khách",
      value: usersCount.toString(),
      desc: "Đã đăng ký hệ thống",
      icon: Users,
      color: "text-blue-400 bg-blue-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Hệ thống Quản trị</h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi tiến độ doanh thu đơn hàng, liên hệ và các tác vụ AI tự động.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={idx} className="p-6 border-white/5 bg-[#0a0822]/60 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">{kpi.label}</span>
                <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
                <span className="text-[10px] text-gray-500 block">{kpi.desc}</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Latest Orders */}
        <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-500" />
              <span>Đơn hàng mới nhất</span>
            </h3>
            <Link href="/admin/orders" className="text-xs text-pink-400 hover:text-white flex items-center gap-1">
              <span>Tất cả</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="py-2.5">Mã đơn</th>
                  <th className="py-2.5">Sản phẩm</th>
                  <th className="py-2.5">Doanh thu</th>
                  <th className="py-2.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5">
                      <td className="py-3 font-mono font-medium text-pink-400">{order.sepayCode}</td>
                      <td className="py-3 font-medium truncate max-w-[150px]">{order.product.title}</td>
                      <td className="py-3 font-bold text-white">{formatVND(order.amount)}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          order.status === "COMPLETED" 
                            ? "bg-green-500/10 text-green-400"
                            : order.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {order.status === "COMPLETED" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{order.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">Chưa có đơn hàng nào phát sinh.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Latest Contacts */}
        <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-500" />
              <span>Hộp thư liên hệ mới</span>
            </h3>
            <Link href="/admin/contacts" className="text-xs text-purple-400 hover:text-white flex items-center gap-1">
              <span>Tất cả</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="py-2.5">Khách hàng</th>
                  <th className="py-2.5">Chủ đề</th>
                  <th className="py-2.5">Ngày gửi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {recentContacts.length > 0 ? (
                  recentContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-white/5">
                      <td className="py-3">
                        <div className="font-semibold text-white">{contact.name}</div>
                        <div className="text-[10px] text-gray-500">{contact.email}</div>
                      </td>
                      <td className="py-3 truncate max-w-[150px]">{contact.subject}</td>
                      <td className="py-3 text-gray-500">{new Date(contact.createdAt).toLocaleDateString("vi-VN")}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-500">Hộp thư liên hệ trống.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
