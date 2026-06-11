"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  CodeSquare,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButton {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action: () => void;
  isActive: boolean;
}

interface ToolbarGroup {
  label: string;
  buttons: ToolbarButton[];
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Bắt đầu viết nội dung...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
        "data-placeholder": placeholder,
      },
    },
  });

  if (!editor) {
    return (
      <div className="border border-white/10 rounded-xl bg-white/5 animate-pulse">
        <div className="h-12 bg-[#0b0921]/60 border-b border-white/5" />
        <div className="min-h-[300px]" />
      </div>
    );
  }

  const toolbarGroups: ToolbarGroup[] = [
    {
      label: "Text",
      buttons: [
        {
          icon: Bold,
          title: "Bold (Ctrl+B)",
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: editor.isActive("bold"),
        },
        {
          icon: Italic,
          title: "Italic (Ctrl+I)",
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor.isActive("italic"),
        },
        {
          icon: Strikethrough,
          title: "Strikethrough (Ctrl+Shift+S)",
          action: () => editor.chain().focus().toggleStrike().run(),
          isActive: editor.isActive("strike"),
        },
        {
          icon: Code,
          title: "Inline Code (Ctrl+E)",
          action: () => editor.chain().focus().toggleCode().run(),
          isActive: editor.isActive("code"),
        },
      ],
    },
    {
      label: "Headings",
      buttons: [
        {
          icon: Heading2,
          title: "Heading 2",
          action: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor.isActive("heading", { level: 2 }),
        },
        {
          icon: Heading3,
          title: "Heading 3",
          action: () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: editor.isActive("heading", { level: 3 }),
        },
        {
          icon: Heading4,
          title: "Heading 4",
          action: () =>
            editor.chain().focus().toggleHeading({ level: 4 }).run(),
          isActive: editor.isActive("heading", { level: 4 }),
        },
      ],
    },
    {
      label: "Lists",
      buttons: [
        {
          icon: List,
          title: "Bullet List",
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor.isActive("bulletList"),
        },
        {
          icon: ListOrdered,
          title: "Ordered List",
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor.isActive("orderedList"),
        },
      ],
    },
    {
      label: "Block",
      buttons: [
        {
          icon: Quote,
          title: "Blockquote",
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: editor.isActive("blockquote"),
        },
        {
          icon: CodeSquare,
          title: "Code Block",
          action: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: editor.isActive("codeBlock"),
        },
        {
          icon: Minus,
          title: "Horizontal Rule",
          action: () => editor.chain().focus().setHorizontalRule().run(),
          isActive: false,
        },
      ],
    },
    {
      label: "Actions",
      buttons: [
        {
          icon: Undo2,
          title: "Undo (Ctrl+Z)",
          action: () => editor.chain().focus().undo().run(),
          isActive: false,
        },
        {
          icon: Redo2,
          title: "Redo (Ctrl+Shift+Z)",
          action: () => editor.chain().focus().redo().run(),
          isActive: false,
        },
      ],
    },
  ];

  return (
    <>
      <style>{`
        .tiptap-editor .ProseMirror {
          min-height: 300px;
          padding: 1rem;
          outline: none;
          color: #e5e7eb;
          font-size: 0.875rem;
          line-height: 1.75;
        }
        .tiptap-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 1.5rem 0 0.5rem;
        }
        .tiptap-editor .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
          margin: 1.25rem 0 0.5rem;
        }
        .tiptap-editor .ProseMirror h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #d1d5db;
          margin: 1rem 0 0.5rem;
        }
        .tiptap-editor .ProseMirror p {
          margin: 0.5rem 0;
        }
        .tiptap-editor .ProseMirror ul,
        .tiptap-editor .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .tiptap-editor .ProseMirror li {
          margin: 0.25rem 0;
        }
        .tiptap-editor .ProseMirror blockquote {
          border-left: 3px solid #ec4899;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #9ca3af;
          font-style: italic;
        }
        .tiptap-editor .ProseMirror code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.8em;
        }
        .tiptap-editor .ProseMirror pre {
          background: rgba(0, 0, 0, 0.4);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .tiptap-editor .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        .tiptap-editor .ProseMirror hr {
          border-color: rgba(255, 255, 255, 0.1);
          margin: 1.5rem 0;
        }
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #4b5563;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>

      <div className="tiptap-editor border border-white/10 rounded-xl overflow-hidden bg-white/5 focus-within:border-pink-500/50 transition-all">
        {/* Toolbar */}
        <div className="bg-[#0b0921]/60 border-b border-white/5 px-2 py-1.5 flex flex-wrap items-center gap-0.5">
          {toolbarGroups.map((group, groupIdx) => (
            <div key={group.label} className="flex items-center">
              {groupIdx > 0 && (
                <div className="w-px h-6 bg-white/10 mx-1.5" />
              )}
              <div className="flex items-center gap-0.5">
                {group.buttons.map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={btn.title}
                      type="button"
                      onClick={btn.action}
                      className={`p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer ${
                        btn.isActive
                          ? "bg-pink-500/20 text-pink-400"
                          : "hover:bg-white/5"
                      }`}
                      title={btn.title}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Editor Content Area */}
        <EditorContent editor={editor} />
      </div>
    </>
  );
}
