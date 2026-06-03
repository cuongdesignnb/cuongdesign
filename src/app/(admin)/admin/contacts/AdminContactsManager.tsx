"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  AlertCircle,
  CheckCircle2,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  User,
  MessageSquare,
  Calendar,
} from "lucide-react";
import {
  markContactProcessed,
  deleteContact,
} from "@/app/actions/admin-contacts";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  productId: string | null;
  isProcessed: boolean;
  createdAt: string;
}

interface Props {
  initialContacts: Contact[];
  stats: {
    total: number;
    unprocessed: number;
    processed: number;
  };
}

type FilterTab = "ALL" | "UNPROCESSED" | "PROCESSED";

export default function AdminContactsManager({
  initialContacts,
  stats,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const filteredContacts = useMemo(() => {
    return initialContacts.filter((contact) => {
      if (activeTab === "UNPROCESSED") return !contact.isProcessed;
      if (activeTab === "PROCESSED") return contact.isProcessed;
      return true;
    });
  }, [initialContacts, activeTab]);

  async function handleMarkProcessed(id: string) {
    setLoading(id);
    const result = await markContactProcessed(id);
    if (result.success) {
      router.refresh();
    } else {
      alert("Lỗi: " + result.error);
    }
    setLoading(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc muốn xoá liên hệ này?")) return;
    setLoading(id);
    const result = await deleteContact(id);
    if (result.success) {
      router.refresh();
    } else {
      alert("Lỗi: " + result.error);
    }
    setLoading(null);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "ALL", label: `Tất cả (${stats.total})` },
    { key: "UNPROCESSED", label: `Chưa xử lý (${stats.unprocessed})` },
    { key: "PROCESSED", label: `Đã xử lý (${stats.processed})` },
  ];

  const statCards = [
    {
      label: "Tổng liên hệ",
      value: stats.total,
      icon: Inbox,
      color: "text-white",
      bg: "bg-white/5",
    },
    {
      label: "Chưa xử lý",
      value: stats.unprocessed,
      icon: AlertCircle,
      color: "text-red-400",
      bg: "bg-red-500/5",
    },
    {
      label: "Đã xử lý",
      value: stats.processed,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/5",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border border-white/5 ${card.bg} p-4`}
          >
            <div className="flex items-center gap-3">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={`text-lg font-semibold ${card.color}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-[#0a0822]/50 border border-white/5 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-pink-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl border border-white/5 bg-[#0a0822]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-4 py-3 text-gray-500 font-medium">Tên</th>
                <th className="px-4 py-3 text-gray-500 font-medium">Email</th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Chủ đề
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Ngày gửi
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium w-24">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Không có liên hệ nào.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <React.Fragment key={contact.id}>
                    <tr
                      className={`hover:bg-white/5 cursor-pointer transition-colors ${
                        loading === contact.id ? "opacity-50" : ""
                      } ${
                        !contact.isProcessed
                          ? "border-l-2 border-l-pink-500"
                          : ""
                      }`}
                      onClick={() =>
                        setExpandedId(
                          expandedId === contact.id ? null : contact.id
                        )
                      }
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-white font-medium">
                            {contact.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {contact.email}
                      </td>
                      <td className="px-4 py-3 text-white truncate max-w-[200px]">
                        {contact.subject}
                      </td>
                      <td className="px-4 py-3">
                        {contact.isProcessed ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            Đã xử lý
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            Chưa xử lý
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!contact.isProcessed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkProcessed(contact.id);
                              }}
                              title="Đánh dấu đã xử lý"
                              className="p-1.5 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-400 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(contact.id);
                            }}
                            title="Xoá liên hệ"
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Message View */}
                    {expandedId === contact.id && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                              <div className="space-y-1">
                                <h4 className="text-gray-500 text-xs uppercase tracking-wider font-medium">
                                  Nội dung tin nhắn
                                </h4>
                                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                  {contact.message}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-2 border-t border-white/5">
                              {contact.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  {contact.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                {formatDate(contact.createdAt)}
                              </div>
                              {contact.productId && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  Product ID: {contact.productId}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-500 text-right">
        Hiển thị {filteredContacts.length} / {initialContacts.length} liên hệ
      </p>
    </div>
  );
}
