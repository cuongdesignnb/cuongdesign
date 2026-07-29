"use client";

import CharacterCount from "@tiptap/extension-character-count";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";
import MediaPickerDialog from "./MediaPickerDialog";

export interface ContentEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  allowMedia?: boolean;
}

function sanitizePastedHtml(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("script,style,iframe,object,embed").forEach((node) => node.remove());
  document.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name.startsWith("on")) element.removeAttribute(attribute.name);
    });
  });
  return document.body.innerHTML;
}

export default function ContentEditor({
  value,
  onChange,
  placeholder = "Bắt đầu viết nội dung...",
  minHeight = 280,
  allowMedia = true,
}: ContentEditorProps) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [sourceMode, setSourceMode] = useState(false);
  const [source, setSource] = useState(value);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Placeholder.configure({ placeholder }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      ImageExtension.configure({ allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      setSource(html);
      onChange(html);
    },
    editorProps: {
      attributes: { class: "focus:outline-none" },
      transformPastedHTML: sanitizePastedHtml,
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return <div className="animate-pulse rounded-md border border-white/10 bg-white/5" style={{ minHeight }} />;
  }
  const activeEditor = editor;

  const buttonClass = (active = false) =>
    `rounded-md p-2 transition-colors ${active ? "bg-pink-500/20 text-pink-400" : "text-gray-400 hover:bg-white/5 hover:text-white"}`;

  function setLink() {
    const current = activeEditor.getAttributes("link").href as string | undefined;
    const href = window.prompt("URL liên kết", current || "https://");
    if (href === null) return;
    if (!href.trim()) return void activeEditor.chain().focus().unsetLink().run();
    activeEditor.chain().focus().extendMarkRange("link").setLink({ href: href.trim(), target: "_blank" }).run();
  }

  function toggleSource() {
    if (sourceMode) {
      activeEditor.commands.setContent(source);
      onChange(activeEditor.getHTML());
    } else {
      setSource(activeEditor.getHTML());
    }
    setSourceMode((current) => !current);
  }

  const buttons = [
    { title: "Bold", icon: Bold, action: () => activeEditor.chain().focus().toggleBold().run(), active: activeEditor.isActive("bold") },
    { title: "Italic", icon: Italic, action: () => activeEditor.chain().focus().toggleItalic().run(), active: activeEditor.isActive("italic") },
    { title: "Strikethrough", icon: Strikethrough, action: () => activeEditor.chain().focus().toggleStrike().run(), active: activeEditor.isActive("strike") },
    { title: "Heading 2", icon: Heading2, action: () => activeEditor.chain().focus().toggleHeading({ level: 2 }).run(), active: activeEditor.isActive("heading", { level: 2 }) },
    { title: "Heading 3", icon: Heading3, action: () => activeEditor.chain().focus().toggleHeading({ level: 3 }).run(), active: activeEditor.isActive("heading", { level: 3 }) },
    { title: "Bullet list", icon: List, action: () => activeEditor.chain().focus().toggleBulletList().run(), active: activeEditor.isActive("bulletList") },
    { title: "Ordered list", icon: ListOrdered, action: () => activeEditor.chain().focus().toggleOrderedList().run(), active: activeEditor.isActive("orderedList") },
    { title: "Quote", icon: Quote, action: () => activeEditor.chain().focus().toggleBlockquote().run(), active: activeEditor.isActive("blockquote") },
    { title: "Link", icon: Link, action: setLink, active: activeEditor.isActive("link") },
    { title: "Align left", icon: AlignLeft, action: () => activeEditor.chain().focus().setTextAlign("left").run(), active: activeEditor.isActive({ textAlign: "left" }) },
    { title: "Align center", icon: AlignCenter, action: () => activeEditor.chain().focus().setTextAlign("center").run(), active: activeEditor.isActive({ textAlign: "center" }) },
    { title: "Align right", icon: AlignRight, action: () => activeEditor.chain().focus().setTextAlign("right").run(), active: activeEditor.isActive({ textAlign: "right" }) },
    { title: "Clear formatting", icon: Eraser, action: () => activeEditor.chain().focus().unsetAllMarks().clearNodes().run(), active: false },
    { title: "Undo", icon: Undo2, action: () => activeEditor.chain().focus().undo().run(), active: false },
    { title: "Redo", icon: Redo2, action: () => activeEditor.chain().focus().redo().run(), active: false },
  ];

  return (
    <>
      <div className="overflow-hidden rounded-md border border-white/10 bg-white/[0.035] focus-within:border-pink-500/50">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 bg-[#0b0921]/80 p-2">
          {buttons.map(({ title, icon: Icon, action, active }) => (
            <button key={title} type="button" title={title} onClick={action} className={buttonClass(active)}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
          {allowMedia && (
            <button type="button" title="Chèn ảnh từ Media Library" onClick={() => setMediaOpen(true)} className={buttonClass()}>
              <ImagePlus className="h-4 w-4" />
            </button>
          )}
          <button type="button" title="HTML source" onClick={toggleSource} className={buttonClass(sourceMode)}>
            <Code2 className="h-4 w-4" />
          </button>
        </div>

        {sourceMode ? (
          <textarea
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              onChange(event.target.value);
            }}
            spellCheck={false}
            className="w-full resize-y bg-black/20 p-4 font-mono text-xs leading-6 text-gray-300 outline-none"
            style={{ minHeight }}
          />
        ) : (
          <div
            className="content-editor prose prose-invert max-w-none px-4 py-3 text-sm leading-7 text-gray-300 [&_.ProseMirror]:outline-none [&_.is-editor-empty:first-child:before]:pointer-events-none [&_.is-editor-empty:first-child:before]:float-left [&_.is-editor-empty:first-child:before]:h-0 [&_.is-editor-empty:first-child:before]:text-gray-600 [&_blockquote]:border-l-2 [&_blockquote]:border-pink-500 [&_blockquote]:pl-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_img]:max-h-[480px] [&_img]:rounded-md [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
            style={{ minHeight }}
          >
            <EditorContent editor={activeEditor} />
          </div>
        )}

        <div className="border-t border-white/5 px-3 py-1.5 text-right text-[10px] text-gray-600">
          {activeEditor.storage.characterCount.characters()} ký tự
        </div>
      </div>

      <MediaPickerDialog
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={([media]) => {
          activeEditor.chain().focus().setImage({ src: media.url, alt: media.alt || media.name }).run();
        }}
      />
    </>
  );
}
