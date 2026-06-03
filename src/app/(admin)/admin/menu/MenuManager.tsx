"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash, ArrowUp, ArrowDown, Move, ChevronRight, Check, ListRestart, Sparkles, Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { getMenuItems, saveMenuItems, getRouteSuggestions, MenuItemInput } from "@/app/actions/menu";

interface LocalMenuItem {
  id: string; // Temporary or DB ID
  label: string;
  href: string | null;
  order: number;
  parentId: string | null;
}

interface RouteSuggestion {
  label: string;
  value: string;
}

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState<LocalMenuItem[]>([]);
  const [suggestions, setSuggestions] = useState<RouteSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<RouteSuggestion[]>([]);
  const [showSuggest, setShowSuggest] = useState<string | null>(null); // item ID currently showing suggestions
  const [searchQuery, setSearchQuery] = useState("");
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Item State
  const [newItem, setNewItem] = useState({
    label: "",
    href: "",
    parentId: "",
  });

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const itemsRes = await getMenuItems();
      const suggestRes = await getRouteSuggestions();

      if (itemsRes.success && itemsRes.items) {
        // Flatten the fetched tree to our flat LocalMenuItem structure
        const flatItems: LocalMenuItem[] = [];
        itemsRes.items.forEach((parent, pIdx) => {
          flatItems.push({
            id: parent.id,
            label: parent.label,
            href: parent.href,
            order: pIdx,
            parentId: null
          });
          
          if (parent.children) {
            parent.children.forEach((child, cIdx) => {
              flatItems.push({
                id: child.id,
                label: child.label,
                href: child.href,
                order: cIdx,
                parentId: parent.id
              });
            });
          }
        });
        setMenuItems(flatItems);
      }

      if (suggestRes.success && suggestRes.suggestions) {
        setSuggestions(suggestRes.suggestions);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Filter suggestions based on input query
  const handlePathSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredSuggestions(suggestions.slice(0, 10));
    } else {
      const filtered = suggestions.filter(s => 
        s.label.toLowerCase().includes(query.toLowerCase()) || 
        s.value.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 10));
    }
  };

  // Add item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.label.trim()) return;

    const tempId = `temp_${Date.now()}`;
    const pId = newItem.parentId || null;

    // Get order count for this parent context
    const existingInParent = menuItems.filter(i => i.parentId === pId);
    const order = existingInParent.length;

    const added: LocalMenuItem = {
      id: tempId,
      label: newItem.label.trim(),
      href: newItem.href.trim() || null,
      order,
      parentId: pId
    };

    setMenuItems(prev => [...prev, added]);
    setNewItem({ label: "", href: "", parentId: "" });
    setStatus({ type: "success", text: "Đã thêm mục menu mới. Vui lòng bấm 'Lưu cấu hình' để ghi vào DB." });
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    // If we delete a parent, we must delete all its children too
    setMenuItems(prev => prev.filter(i => i.id !== id && i.parentId !== id));
    setStatus({ type: "success", text: "Đã xóa mục. Vui lòng bấm 'Lưu cấu hình' để hoàn tất." });
  };

  // Drag and Drop State
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedItem = menuItems.find(i => i.id === draggedId);
    const targetItem = menuItems.find(i => i.id === targetId);

    if (!draggedItem || !targetItem) return;

    // Constraints: Can only drag within the same level (same parentId)
    if (draggedItem.parentId !== targetItem.parentId) {
      setStatus({ type: "error", text: "Chỉ có thể kéo xếp thứ tự cùng nhóm (cùng cấp)." });
      return;
    }

    const sameLevelItems = menuItems.filter(i => i.parentId === draggedItem.parentId)
      .sort((a, b) => a.order - b.order);

    const draggedIndex = sameLevelItems.findIndex(i => i.id === draggedId);
    const targetIndex = sameLevelItems.findIndex(i => i.id === targetId);

    // Swap / reorder
    const reorderedSameLevel = [...sameLevelItems];
    reorderedSameLevel.splice(draggedIndex, 1);
    reorderedSameLevel.splice(targetIndex, 0, draggedItem);

    // Update orders
    const updated = menuItems.map(item => {
      if (item.parentId === draggedItem.parentId) {
        const newIdx = reorderedSameLevel.findIndex(i => i.id === item.id);
        return { ...item, order: newIdx };
      }
      return item;
    });

    setMenuItems(updated);
    setDraggedId(null);
    setStatus({ type: "success", text: "Đã thay đổi vị trí. Bấm 'Lưu cấu hình' để cập nhật." });
  };

  // Arrow Reordering (Move Up / Down)
  const moveItem = (id: string, direction: "up" | "down") => {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    const sameLevelItems = menuItems.filter(i => i.parentId === item.parentId)
      .sort((a, b) => a.order - b.order);

    const idx = sameLevelItems.findIndex(i => i.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sameLevelItems.length - 1) return;

    const swapTargetIdx = direction === "up" ? idx - 1 : idx + 1;
    const swapTarget = sameLevelItems[swapTargetIdx];

    const updated = menuItems.map(i => {
      if (i.id === item.id) {
        return { ...i, order: swapTarget.order };
      }
      if (i.id === swapTarget.id) {
        return { ...i, order: item.order };
      }
      return i;
    });

    setMenuItems(updated);
    setStatus({ type: "success", text: "Đã cập nhật vị trí. Vui lòng bấm 'Lưu cấu hình' để lưu." });
  };

  // Convert to child / parent indentation shifts
  const indentItem = (id: string, action: "indent" | "outdent") => {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    if (action === "indent") {
      // Indent: Make this item a child of the root item immediately above it
      if (item.parentId !== null) return; // Already a child

      const rootItems = menuItems.filter(i => i.parentId === null).sort((a, b) => a.order - b.order);
      const idx = rootItems.findIndex(i => i.id === id);
      if (idx === 0) {
        setStatus({ type: "error", text: "Không có mục cha phía trên để đưa vào trong." });
        return;
      }

      const parentTarget = rootItems[idx - 1];
      const childrenOfParent = menuItems.filter(i => i.parentId === parentTarget.id);

      setMenuItems(prev => prev.map(i => {
        if (i.id === id) {
          return { ...i, parentId: parentTarget.id, order: childrenOfParent.length };
        }
        return i;
      }));
    } else {
      // Outdent: Shift child item back to root level
      if (item.parentId === null) return; // Already a root item

      const rootItems = menuItems.filter(i => i.parentId === null).sort((a, b) => a.order - b.order);

      setMenuItems(prev => prev.map(i => {
        if (i.id === id) {
          return { ...i, parentId: null, order: rootItems.length };
        }
        return i;
      }));
    }
    setStatus({ type: "success", text: "Đã phân cấp lại. Bấm 'Lưu cấu hình' để hoàn tất." });
  };

  // Save changes to DB
  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    // Format fields to clean model inputs
    const formatted: MenuItemInput[] = menuItems.map(item => ({
      id: item.id.startsWith("temp_") ? undefined : item.id,
      label: item.label,
      href: item.href,
      order: item.order,
      parentId: item.parentId
    }));

    try {
      const res = await saveMenuItems(formatted);
      if (res.success) {
        setStatus({ type: "success", text: res.message || "Lưu cấu hình thành công!" });
        // Reload values to replace temporary keys with DB actual ids
        const itemsRes = await getMenuItems();
        if (itemsRes.success && itemsRes.items) {
          const flatItems: LocalMenuItem[] = [];
          itemsRes.items.forEach((parent, pIdx) => {
            flatItems.push({
              id: parent.id,
              label: parent.label,
              href: parent.href,
              order: pIdx,
              parentId: null
            });
            if (parent.children) {
              parent.children.forEach((child, cIdx) => {
                flatItems.push({
                  id: child.id,
                  label: child.label,
                  href: child.href,
                  order: cIdx,
                  parentId: parent.id
                });
              });
            }
          });
          setMenuItems(flatItems);
        }
      } else {
        setStatus({ type: "error", text: res.error || "Gặp lỗi khi lưu." });
      }
    } catch (err: any) {
      setStatus({ type: "error", text: err.message || "Lỗi lưu dữ liệu." });
    } finally {
      setSaving(false);
    }
  };

  // Restore default seed configuration
  const handleResetToDefaults = () => {
    if (!confirm("Bạn có chắc chắn muốn đặt lại Menu về cấu hình dropdown mặc định? Toàn bộ thiết lập hiện tại sẽ bị ghi đè.")) {
      return;
    }

    const defaultSeed: LocalMenuItem[] = [
      { id: "seed_1", label: "Trang chủ", href: "/", order: 0, parentId: null },
      
      { id: "seed_2", label: "Giới thiệu", href: null, order: 1, parentId: null },
      { id: "seed_2_1", label: "Hồ sơ cá nhân", href: "/gioi-thieu", order: 0, parentId: "seed_2" },
      { id: "seed_2_2", label: "Quy trình làm việc", href: "/quy-trinh", order: 1, parentId: "seed_2" },
      { id: "seed_2_3", label: "Kỹ năng & Công nghệ", href: "/ky-nang", order: 2, parentId: "seed_2" },
      
      { id: "seed_3", label: "Chuyên môn", href: null, order: 2, parentId: null },
      { id: "seed_3_1", label: "Dịch vụ cung cấp", href: "/dich-vu", order: 0, parentId: "seed_3" },
      { id: "seed_3_2", label: "Dự án thực tế", href: "/du-an", order: 1, parentId: "seed_3" },
      
      { id: "seed_4", label: "Cửa hàng & Tin tức", href: null, order: 3, parentId: null },
      { id: "seed_4_1", label: "Sản phẩm số", href: "/san-pham", order: 0, parentId: "seed_4" },
      { id: "seed_4_2", label: "Bài viết & Blog", href: "/bai-viet", order: 1, parentId: "seed_4" },
      
      { id: "seed_5", label: "Đánh giá", href: "/danh-gia", order: 4, parentId: null },
      { id: "seed_6", label: "Liên hệ & FAQ", href: "/lien-he", order: 5, parentId: null },
    ];

    setMenuItems(defaultSeed);
    setStatus({ type: "success", text: "Đã chuẩn bị menu mặc định. Vui lòng bấm 'Lưu cấu hình' để áp dụng thực tế." });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }

  // Find root and children lists sorted by order
  const rootItems = menuItems.filter(i => i.parentId === null).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500 animate-pulse" />
            <span>Quản lý Menu Phân Cấp</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Xây dựng menu điều hướng đa tầng với kéo thả hoặc nút nhấn. Hỗ trợ tự động gợi ý liên kết tĩnh và động (Dự án, Sản phẩm, Blog) để tối ưu SEO.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 border-white/5 hover:border-pink-500/30"
          >
            <ListRestart className="w-4 h-4 text-pink-400" />
            <span>Menu Mặc định</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Đang đồng bộ..." : "Lưu cấu hình"}
          </Button>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl border text-xs text-left ${
          status.type === "success" 
            ? "bg-green-500/10 border-green-500/20 text-green-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {status.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form to Add Item (4 cols) */}
        <div className="lg:col-span-4">
          <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 text-left">
            <h3 className="text-sm font-bold text-white mb-4">Thêm mục Menu mới</h3>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase font-semibold">Tên hiển thị *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Landing Page, Hướng dẫn..."
                  value={newItem.label}
                  onChange={e => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                  className="glass-input w-full px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="text-[10px] text-gray-500 font-mono uppercase font-semibold">Đường dẫn liên kết (Href)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ví dụ: /du-an, /lien-he..."
                    value={newItem.href}
                    onChange={e => {
                      setNewItem(prev => ({ ...prev, href: e.target.value }));
                      handlePathSearch(e.target.value);
                      setShowSuggest("new_item");
                    }}
                    onFocus={() => {
                      handlePathSearch(newItem.href);
                      setShowSuggest("new_item");
                    }}
                    className="glass-input w-full px-3 py-2 text-xs pr-8 focus:outline-none"
                  />
                  {newItem.href && (
                    <button 
                      type="button" 
                      onClick={() => setNewItem(prev => ({ ...prev, href: "" }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-[10px]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Suggestions Autocomplete Panel */}
                {showSuggest === "new_item" && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[60px] bg-[#0c0a21]/95 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-2 shadow-2xl space-y-1 animate-in fade-in duration-100">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] text-pink-400 font-mono font-bold uppercase tracking-wider border-b border-white/5 mb-1">
                      <Search className="w-3 h-3" />
                      <span>Đường dẫn gợi ý chuẩn SEO</span>
                    </div>
                    {filteredSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewItem(prev => ({ ...prev, href: s.value }));
                          setShowSuggest(null);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] text-gray-300 hover:bg-white/5 hover:text-white flex justify-between gap-2"
                      >
                        <span className="truncate max-w-[170px]">{s.label}</span>
                        <span className="text-pink-500 shrink-0 font-mono">{s.value}</span>
                      </button>
                    ))}
                  </div>
                )}
                <span className="text-[9px] text-gray-500 block mt-1">Nhập "/" để chọn hoặc tự động tìm kiếm. Để trống nếu là danh mục cha.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase font-semibold">Danh mục cha (Cấp 1)</label>
                <select
                  value={newItem.parentId}
                  onChange={e => setNewItem(prev => ({ ...prev, parentId: e.target.value }))}
                  className="glass-input w-full px-3 py-2 text-xs bg-transparent border border-white/10 rounded-xl text-gray-300 focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#0b0921] text-white">Làm danh mục gốc (Cấp 1)</option>
                  {rootItems.map(root => (
                    <option key={root.id} value={root.id} className="bg-[#0b0921] text-white">
                      Dưới: {root.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full flex items-center justify-center gap-1.5 pt-2">
                <Plus className="w-4 h-4" />
                <span>Thêm vào danh sách</span>
              </Button>

            </form>
          </GlassCard>
        </div>

        {/* Right Column: Dynamic Tree List (8 cols) */}
        <div className="lg:col-span-8">
          <GlassCard className="p-6 border-white/5 bg-[#0a0822]/60 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">Cấu trúc Menu Hiện tại</h3>
              <span className="text-[10px] text-gray-500 font-mono">
                Tổng cộng: {menuItems.length} mục
              </span>
            </div>

            {rootItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                Chưa có mục menu nào. Hãy nhấn "Menu Mặc định" để tạo cấu trúc dropdown đề xuất hoặc nhập thủ công ở ô bên cạnh.
              </div>
            ) : (
              <div className="space-y-3">
                {rootItems.map((root, rootIdx) => {
                  const children = menuItems
                    .filter(i => i.parentId === root.id)
                    .sort((a, b) => a.order - b.order);

                  return (
                    <div 
                      key={root.id}
                      className="space-y-2 border border-white/5 p-3 rounded-xl bg-black/10 hover:bg-black/20 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, root.id)}
                    >
                      {/* Root Row */}
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, root.id)}
                        className="flex items-center justify-between gap-3 group cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-white/3"
                      >
                        <div className="flex items-center space-x-3 text-sm text-white font-semibold">
                          <Move className="w-4 h-4 text-gray-600 group-hover:text-pink-400 shrink-0" />
                          <span>{root.label}</span>
                          {root.href && (
                            <span className="text-[10px] font-mono text-pink-500 bg-pink-500/5 px-2 py-0.5 rounded border border-pink-500/10">
                              {root.href}
                            </span>
                          )}
                          {!root.href && (
                            <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                              Thả xuống / Dropdown parent
                            </span>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveItem(root.id, "up")}
                            disabled={rootIdx === 0}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-20 transition-colors"
                            title="Di chuyển lên"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveItem(root.id, "down")}
                            disabled={rootIdx === rootItems.length - 1}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-20 transition-colors"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => indentItem(root.id, "indent")}
                            className="p-1 text-gray-500 hover:text-pink-400 transition-colors"
                            title="Đưa vào trong (Làm con mục phía trên)"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(root.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors ml-1"
                            title="Xóa mục"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Children Rows */}
                      {children.length > 0 && (
                        <div className="pl-6 border-l border-white/5 space-y-1.5 mt-1">
                          {children.map((child, childIdx) => (
                            <div
                              key={child.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, child.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, child.id)}
                              className="flex items-center justify-between gap-3 group/child cursor-grab active:cursor-grabbing p-2 rounded-lg bg-[#0c0a21]/60 hover:bg-[#0c0a21]/90 border border-white/3 hover:border-white/10"
                            >
                              <div className="flex items-center space-x-2 text-xs text-gray-300">
                                <Move className="w-3.5 h-3.5 text-gray-700 group-hover/child:text-purple-400 shrink-0" />
                                <span>{child.label}</span>
                                <span className="text-[9px] font-mono text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">
                                  {child.href}
                                </span>
                              </div>

                              {/* Child Controls */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => moveItem(child.id, "up")}
                                  disabled={childIdx === 0}
                                  className="p-1 text-gray-500 hover:text-white disabled:opacity-20 transition-colors"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => moveItem(child.id, "down")}
                                  disabled={childIdx === children.length - 1}
                                  className="p-1 text-gray-500 hover:text-white disabled:opacity-20 transition-colors"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => indentItem(child.id, "outdent")}
                                  className="p-1 text-gray-500 hover:text-pink-400 transition-colors"
                                  title="Đưa ra ngoài làm mục chính"
                                >
                                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(child.id)}
                                  className="p-1 text-gray-500 hover:text-red-400 transition-colors ml-1"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
