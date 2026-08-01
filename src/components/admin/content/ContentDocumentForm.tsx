"use client";

import {
  publishContentDocument,
  saveContentDraft,
} from "@/app/actions/content";
import ContentEditor from "./ContentEditor";
import ContentSectionCard from "./ContentSectionCard";
import LinkField from "./LinkField";
import MediaField from "./MediaField";
import MediaGalleryField from "./MediaGalleryField";
import PublishBar from "./PublishBar";
import RepeaterField from "./RepeaterField";
import SeoFields from "./SeoFields";
import UnsavedChangesGuard from "./UnsavedChangesGuard";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ContentObject = Record<string, unknown>;

interface ContentDocumentFormProps {
  contentKey: string;
  name: string;
  route: string | null;
  documentId?: string;
  initialData: ContentObject;
  publishedAt?: string | null;
}

function labelFor(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (value) => value.toUpperCase());
}

function blankItem(path: string, sample?: unknown): unknown {
  if (sample !== undefined) {
    if (typeof sample === "string") return "";
    if (typeof sample === "number") return 0;
    if (typeof sample === "boolean") return false;
    if (sample && typeof sample === "object") {
      return Object.fromEntries(
        Object.entries(sample as ContentObject).map(([key, value]) => [key, blankItem(`${path}.${key}`, value)]),
      );
    }
  }
  const key = path.split(".").at(-1);
  if (key === "faqs") return { question: "", answer: "" };
  if (key === "timeline") return { period: "", role: "", company: "", description: "" };
  if (path === "skills") return { title: "", skills: [] };
  if (key === "skills") return { name: "", level: 0 };
  if (key === "categories") return { name: "", description: "", iconKey: "Layout", order: 0 };
  if (key === "certificates") return { title: "", issuer: "", year: "", media: "" };
  if (key === "achievements") return { title: "", description: "", iconKey: "" };
  if (key === "customLinks") return { label: "", url: "", enabled: true };
  if (key === "technologies") return { name: "", category: "", iconKey: "", iconMedia: "", order: 0, visible: true };
  if (key === "steps") return { number: "", titleVi: "", titleEn: "", description: "", iconKey: "", deliverables: [], time: "" };
  return "";
}

function isObject(value: unknown): value is ContentObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export default function ContentDocumentForm({
  contentKey,
  name,
  route,
  documentId,
  initialData,
  publishedAt,
}: ContentDocumentFormProps) {
  const router = useRouter();
  const [data, setData] = useState<ContentObject>(initialData);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initialData));
  const [busy, setBusy] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState(documentId);
  const [currentPublishedAt, setCurrentPublishedAt] = useState(publishedAt);
  const unsaved = useMemo(() => JSON.stringify(data) !== savedSnapshot, [data, savedSnapshot]);

  function actionError(error: unknown, fallback: string) {
    if (error instanceof Error && error.message.includes("Failed to find Server Action")) {
      return "Phiên làm việc đã cũ sau khi hệ thống cập nhật. Hãy tải lại trang bằng Ctrl+F5 rồi lưu lại.";
    }
    return error instanceof Error ? error.message : fallback;
  }

  async function save(showMessage = true) {
    setBusy(true);
    try {
      const result = await saveContentDraft(contentKey, data);
      if (!result.success) {
        window.alert(result.error);
        return false;
      }
      const document = result.data as { id?: string };
      if (document.id) setCurrentDocumentId(document.id);
      setSavedSnapshot(JSON.stringify(data));
      if (showMessage) window.alert("Đã lưu bản nháp.");
      router.refresh();
      return true;
    } catch (error) {
      window.alert(actionError(error, "Không thể lưu bản nháp."));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    const saved = await save(false);
    if (!saved) return;
    setBusy(true);
    try {
      const result = await publishContentDocument(contentKey);
      if (!result.success) return window.alert(result.error);
      const document = result.data as { publishedAt?: string | Date | null };
      setCurrentPublishedAt(document.publishedAt ? String(document.publishedAt) : new Date().toISOString());
      window.alert("Đã publish nội dung.");
      router.refresh();
    } catch (error) {
      window.alert(actionError(error, "Không thể publish nội dung."));
    } finally {
      setBusy(false);
    }
  }

  function renderField(key: string, value: unknown, onChange: (value: unknown) => void, path: string): React.ReactNode {
    const label = labelFor(key);
    const lower = key.toLowerCase();

    if (Array.isArray(value)) {
      if (/gallery|images/.test(lower) && value.every((item) => typeof item === "string")) {
        return <MediaGalleryField label={label} value={value as string[]} onChange={onChange} />;
      }
      return (
        <RepeaterField
          label={label}
          items={value}
          createItem={() => blankItem(path, value[0])}
          onChange={onChange}
          itemLabel={(item, index) =>
            isObject(item)
              ? String(item.title || item.name || item.label || item.question || `Mục ${index + 1}`)
              : String(item || `Mục ${index + 1}`)
          }
          renderItem={(item, _index, update) =>
            isObject(item) ? (
              Object.entries(item).map(([itemKey, itemValue]) => (
                <div key={itemKey}>
                  {renderField(itemKey, itemValue, (next) => update({ ...item, [itemKey]: next }), `${path}.${itemKey}`)}
                </div>
              ))
            ) : (
              renderField("value", item, update, `${path}.value`)
            )
          }
        />
      );
    }

    if (isObject(value)) {
      if (/cta$/.test(lower) && ("label" in value || "url" in value)) {
        return <div className="space-y-2"><label className="text-xs font-medium text-gray-300">{label}</label><LinkField value={value} onChange={onChange} /></div>;
      }
      if ((key === "metadata" || key === "seo") && ("title" in value || "description" in value)) {
        return <SeoFields value={value} onChange={onChange} />;
      }
      return (
        <fieldset className="grid gap-4 border-l border-white/10 pl-4">
          <legend className="mb-2 text-xs font-semibold text-gray-300">{label}</legend>
          {Object.entries(value).map(([childKey, childValue]) => (
            <div key={childKey}>
              {renderField(childKey, childValue, (next) => onChange({ ...value, [childKey]: next }), `${path}.${childKey}`)}
            </div>
          ))}
        </fieldset>
      );
    }

    if (typeof value === "boolean") {
      return <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
    }

    if (typeof value === "number") {
      return <label className="block space-y-1 text-xs text-gray-400">{label}<input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" /></label>;
    }

    const stringValue = String(value ?? "");
    if (/media|image|avatar|logo|favicon/.test(lower)) {
      return <MediaField label={label} value={stringValue} valueMode={lower.endsWith("mediaid") ? "id" : "url"} onChange={onChange} />;
    }
    if (stringValue.includes("<") || /content|biography|introduction/.test(lower)) {
      return <div className="space-y-2"><label className="text-xs font-medium text-gray-300">{label}</label><ContentEditor value={stringValue} onChange={onChange} /></div>;
    }
    const multiline = stringValue.length > 180 || /description|subtitle|intro|message/.test(lower);
    return (
      <label className="block space-y-1 text-xs text-gray-400">
        {label}
        {multiline ? (
          <textarea value={stringValue} onChange={(event) => onChange(event.target.value)} rows={3} className="w-full resize-y rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-pink-500/50" />
        ) : (
          <input value={stringValue} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-pink-500/50" />
        )}
      </label>
    );
  }

  return (
    <div className="space-y-5">
      <UnsavedChangesGuard active={unsaved} />
      <header>
        <h1 className="text-2xl font-bold text-white">{name}</h1>
        <p className="mt-1 text-sm text-gray-500">Chỉnh sửa bản nháp, kiểm tra Preview rồi Publish khi sẵn sàng.</p>
      </header>

      <div className="rounded-md border border-white/10 bg-white/[0.02] px-5">
        {Object.entries(data).map(([section, value], index) => (
          <ContentSectionCard key={section} title={labelFor(section)} defaultOpen={index === 0}>
            {isObject(value)
              ? Object.entries(value).map(([key, fieldValue]) => (
                  <div key={key}>{renderField(key, fieldValue, (next) => setData((current) => ({ ...current, [section]: { ...(current[section] as ContentObject), [key]: next } })), `${section}.${key}`)}</div>
                ))
              : renderField(section, value, (next) => setData((current) => ({ ...current, [section]: next })), section)}
          </ContentSectionCard>
        ))}
      </div>

      <PublishBar
        documentId={currentDocumentId}
        publishedAt={currentPublishedAt}
        unsaved={unsaved}
        busy={busy}
        onSave={() => void save()}
        onPublish={() => void publish()}
        onPreview={() => {
          if (!route) return window.alert("Nội dung này không có route Preview riêng.");
          window.open(`/api/admin/content/preview?key=${encodeURIComponent(contentKey)}`, "_blank", "noopener,noreferrer");
        }}
      />
    </div>
  );
}
