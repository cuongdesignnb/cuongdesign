"use client";

import {
  createServiceContent,
  updateServiceContent,
} from "@/app/actions/service-content";
import ContentEditor from "./ContentEditor";
import MediaField from "./MediaField";
import RepeaterField from "./RepeaterField";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TitledItem { title: string; description: string }
interface ProcessItem extends TitledItem { step: number }
interface FaqItem { question: string; answer: string }

interface ServiceFormValue {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  heroContent: string;
  iconKey: string;
  colorKey: string;
  coverMediaId: string;
  priceText: string;
  durationText: string;
  features: TitledItem[];
  process: ProcessItem[];
  faqs: FaqItem[];
  ctaText: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  isPublished: boolean;
  order: number;
}

const inputClass = "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-pink-500/50";

export default function ServiceContentForm({ initial }: { initial: ServiceFormValue }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ServiceFormValue>(key: K, value: ServiceFormValue[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = form.id
      ? await updateServiceContent(form.id, form)
      : await createServiceContent(form);
    setBusy(false);
    if (!result.success) return window.alert(result.error);
    router.push("/admin/content/services");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <header>
        <Link href="/admin/content/services" className="inline-flex items-center gap-1 text-xs text-pink-400"><ArrowLeft className="h-3.5 w-3.5" />Danh sách dịch vụ</Link>
        <h1 className="mt-3 text-2xl font-bold text-white">{form.id ? "Sửa dịch vụ" : "Thêm dịch vụ"}</h1>
      </header>

      <div className="grid gap-5 rounded-md border border-white/10 bg-white/[0.02] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-xs text-gray-400">Tiêu đề<input required value={form.title} onChange={(event) => set("title", event.target.value)} className={inputClass} /></label>
          <label className="space-y-1 text-xs text-gray-400">Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => set("slug", event.target.value.toLowerCase())} className={`${inputClass} font-mono`} /></label>
          <label className="space-y-1 text-xs text-gray-400">Phụ đề<input value={form.subtitle} onChange={(event) => set("subtitle", event.target.value)} className={inputClass} /></label>
          <label className="space-y-1 text-xs text-gray-400">Icon key<input value={form.iconKey} onChange={(event) => set("iconKey", event.target.value)} placeholder="Globe" className={inputClass} /></label>
          <label className="space-y-1 text-xs text-gray-400">Color token<select value={form.colorKey} onChange={(event) => set("colorKey", event.target.value)} className={`${inputClass} bg-[#0a0822]`}><option value="">Mặc định</option>{["pink","purple","blue","emerald","amber","cyan","violet"].map((color) => <option key={color} value={color}>{color}</option>)}</select></label>
          <label className="space-y-1 text-xs text-gray-400">Thứ tự<input type="number" value={form.order} onChange={(event) => set("order", Number(event.target.value))} className={inputClass} /></label>
        </div>

        <label className="space-y-1 text-xs text-gray-400">Mô tả ngắn<textarea required rows={3} value={form.shortDescription} onChange={(event) => set("shortDescription", event.target.value)} className={inputClass} /></label>
        <div className="space-y-2"><label className="text-xs text-gray-400">Nội dung Hero</label><ContentEditor value={form.heroContent} onChange={(value) => set("heroContent", value)} /></div>
        <MediaField label="Ảnh cover" value={form.coverMediaId} valueMode="id" onChange={(value) => set("coverMediaId", value)} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-xs text-gray-400">Giá hiển thị<input value={form.priceText} onChange={(event) => set("priceText", event.target.value)} className={inputClass} /></label>
          <label className="space-y-1 text-xs text-gray-400">Thời gian thực hiện<input value={form.durationText} onChange={(event) => set("durationText", event.target.value)} className={inputClass} /></label>
        </div>

        <RepeaterField
          label="Features"
          items={form.features}
          createItem={() => ({ title: "", description: "" })}
          onChange={(value) => set("features", value)}
          itemLabel={(item, index) => item.title || `Feature ${index + 1}`}
          renderItem={(item, _index, update) => (
            <>
              <input value={item.title} onChange={(event) => update({ ...item, title: event.target.value })} placeholder="Tiêu đề" className={inputClass} />
              <textarea value={item.description} onChange={(event) => update({ ...item, description: event.target.value })} placeholder="Mô tả" rows={2} className={inputClass} />
            </>
          )}
        />
        <RepeaterField
          label="Quy trình"
          items={form.process}
          createItem={() => ({ step: form.process.length + 1, title: "", description: "" })}
          onChange={(value) => set("process", value)}
          itemLabel={(item) => `${item.step}. ${item.title || "Bước mới"}`}
          renderItem={(item, _index, update) => (
            <>
              <input type="number" value={item.step} onChange={(event) => update({ ...item, step: Number(event.target.value) })} className={inputClass} />
              <input value={item.title} onChange={(event) => update({ ...item, title: event.target.value })} placeholder="Tiêu đề" className={inputClass} />
              <textarea value={item.description} onChange={(event) => update({ ...item, description: event.target.value })} placeholder="Mô tả" rows={2} className={inputClass} />
            </>
          )}
        />
        <RepeaterField
          label="FAQ"
          items={form.faqs}
          createItem={() => ({ question: "", answer: "" })}
          onChange={(value) => set("faqs", value)}
          itemLabel={(item, index) => item.question || `FAQ ${index + 1}`}
          renderItem={(item, _index, update) => (
            <>
              <input value={item.question} onChange={(event) => update({ ...item, question: event.target.value })} placeholder="Câu hỏi" className={inputClass} />
              <ContentEditor value={item.answer} onChange={(answer) => update({ ...item, answer })} minHeight={160} />
            </>
          )}
        />

        <label className="space-y-1 text-xs text-gray-400">CTA<input value={form.ctaText} onChange={(event) => set("ctaText", event.target.value)} className={inputClass} /></label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-xs text-gray-400">SEO title<input value={form.seoTitle} onChange={(event) => set("seoTitle", event.target.value)} className={inputClass} /></label>
          <label className="space-y-1 text-xs text-gray-400">SEO keywords<input value={form.seoKeywords.join(", ")} onChange={(event) => set("seoKeywords", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} className={inputClass} /></label>
        </div>
        <label className="space-y-1 text-xs text-gray-400">SEO description<textarea rows={3} value={form.seoDescription} onChange={(event) => set("seoDescription", event.target.value)} className={inputClass} /></label>
        <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={form.isPublished} onChange={(event) => set("isPublished", event.target.checked)} />Published</label>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-pink-600 px-4 py-2 text-xs font-semibold text-white hover:bg-pink-500 disabled:opacity-50"><Save className="h-4 w-4" />{busy ? "Đang lưu..." : "Lưu dịch vụ"}</button>
      </div>
    </form>
  );
}
