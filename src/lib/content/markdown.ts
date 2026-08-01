function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeHref(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return /^(https:|mailto:|tel:)/i.test(value);
}

function inlineMarkdown(value: string) {
  const links: string[] = [];
  const withPlaceholders = value.replace(
    /\[([^\]]+)]\(([^\s)]+)\)/g,
    (_match, label: string, href: string) => {
      const token = `@@CHAT_LINK_${links.length}@@`;
      links.push(
        safeHref(href)
          ? `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`
          : escapeHtml(label),
      );
      return token;
    },
  );

  let html = escapeHtml(withPlaceholders)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

  links.forEach((link, index) => {
    html = html.replace(`@@CHAT_LINK_${index}@@`, link);
  });
  return html;
}

/** Converts the small Markdown subset used by AI replies into escaped HTML. */
export function markdownToHtml(value: string) {
  const lines = value.replace(/\r\n?/g, "\n").trim().split("\n");
  if (lines.length === 1 && !lines[0]) return "";

  const blocks: string[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(`<p>${paragraph.map(inlineMarkdown).join("<br />")}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push(`<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`);
    list = null;
  };
  const flushCode = () => {
    if (!code) return;
    blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    code = null;
  };

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      if (code) flushCode();
      else {
        flushParagraph();
        flushList();
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(4, Math.max(2, heading[1].length));
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push("<hr />");
      continue;
    }
    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const type = unordered ? "ul" : "ol";
      if (list && list.type !== type) flushList();
      list ||= { type, items: [] };
      list.items.push((unordered || ordered)![1]);
      continue;
    }
    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote><p>${inlineMarkdown(trimmed.slice(2))}</p></blockquote>`);
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushCode();
  return blocks.join("");
}
