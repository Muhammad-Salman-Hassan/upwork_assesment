import { useState, useMemo, useEffect, useRef } from "react";
import {
  FileText, Search, ChevronLeft, ChevronRight,
  UploadCloud, X, CheckCircle2, Loader2,
} from "lucide-react";
import type { PageData, Language, FrameNode, TextNode, PageNode } from "../types";
import { fileService } from "../services/fileService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
  id: number;
  title_en: string;
  title_ar: string;
  link_en: string;
  link_ar: string;
}

interface NewsTabProps {
  readonly pageData: PageData;
  readonly language: Language;
  readonly onSectionsChange?: (sections: PageNode[]) => void;
}

type UploadStatus = "idle" | "uploading" | "done" | "error";

const emptyForm = { title_en: "", title_ar: "", link_en: "", link_ar: "" };
const PAGE_SIZE = 8;

// ─── PDF Uploader ─────────────────────────────────────────────────────────────

function PdfUploader({
  label, value, onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState<string>(() => value.split("/").pop() ?? "");
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStatus("uploading");
    try {
      const url = await fileService.uploadFile(file);
      onChange(url);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clear() {
    onChange("");
    setFileName("");
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  function dropZoneClass() {
    if (dragOver) return "border-blue-400 bg-blue-50";
    if (status === "done") return "border-green-300 bg-green-50";
    if (status === "error") return "border-red-300 bg-red-50";
    return "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <div
        onClick={() => status !== "uploading" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 cursor-pointer transition-colors select-none ${dropZoneClass()}`}
      >
        {status === "uploading" && (
          <>
            <Loader2 size={22} className="text-blue-500 animate-spin" />
            <span className="text-xs text-blue-500 font-medium">Uploading…</span>
          </>
        )}
        {status === "done" && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              <span className="text-xs text-green-700 font-medium truncate">{fileName}</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="ml-2 shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {status === "error" && (
          <>
            <X size={22} className="text-red-500" />
            <span className="text-xs text-red-500 font-medium">Upload failed — click to retry</span>
          </>
        )}
        {status === "idle" && (
          <>
            <UploadCloud size={22} className="text-gray-400" />
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">Drop PDF here or <span className="text-blue-500">browse</span></p>
              <p className="text-[11px] text-gray-400 mt-0.5">PDF files only</p>
            </div>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

// ─── Parse / Rebuild ──────────────────────────────────────────────────────────

// Structure: sections[0] (frame) → children[1] (frame, horizontal grid) → children[n] (frame card) → children[0] (text, key="news")
function parseNews(pageData: PageData): NewsItem[] {
  try {
    const outer = pageData.sections?.[0];
    if (!outer || outer.type !== "frame") return [];

    const gridFrame = (outer as FrameNode).params.children?.[1];
    if (!gridFrame || gridFrame.type !== "frame") return [];

    const items: NewsItem[] = [];
    for (const card of (gridFrame as FrameNode).params.children ?? []) {
      if (card.type !== "frame") continue;
      const textNode = (card as FrameNode).params.children?.[0];
      if (!textNode || textNode.type !== "text") continue;
      const p = (textNode as TextNode).params;
      items.push({
        id: card.id ?? textNode.id ?? Date.now() + Math.random(),
        title_en: String(p.content_en ?? ""),
        title_ar: String(p.content_ar ?? ""),
        link_en: String(p.link_en ?? ""),
        link_ar: String(p.link_ar ?? ""),
      });
    }
    return items;
  } catch {
    return [];
  }
}

const NEWS_TEXT_STYLES = {
  lg: { align: "center", color: "primary", size: "base", underline: false, weight: "500" },
  sm: { align: "center", color: "primary", size: "base", underline: false, weight: "500" },
};

const NEWS_CARD_STYLES = {
  lg: { align: "center", background: "primary", margin: "my-4", padding: "px-12 py-12", radius: "2xl", width: "25" },
  sm: { align: "center", background: "primary", padding: "px-12 py-12", radius: "2xl" },
};

function buildCard(item: NewsItem): FrameNode {
  return {
    id: item.id,
    styles: NEWS_CARD_STYLES,
    type: "frame",
    params: {
      children: [{
        key: "news",
        styles: NEWS_TEXT_STYLES,
        type: "text",
        params: { content_en: item.title_en, content_ar: item.title_ar, link_en: item.link_en, link_ar: item.link_ar },
      }],
    },
  };
}

function rebuildSections(pageData: PageData, items: NewsItem[]): PageNode[] {
  const sections = pageData.sections ?? [];
  const outer = sections[0];
  if (!outer || outer.type !== "frame") return sections;

  const outerChildren = (outer as FrameNode).params.children;
  const gridFrame = outerChildren?.[1];
  if (!gridFrame || gridFrame.type !== "frame") return sections;

  const newGrid: FrameNode = {
    ...(gridFrame as FrameNode),
    params: { ...(gridFrame as FrameNode).params, children: items.map(buildCard) },
  };

  const newOuter: FrameNode = {
    ...(outer as FrameNode),
    params: {
      ...(outer as FrameNode).params,
      children: [outerChildren[0], newGrid, ...outerChildren.slice(2)],
    },
  };

  return [newOuter, ...sections.slice(1)];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewsTab({ pageData, language, onSectionsChange }: NewsTabProps) {
  const [items, setItems] = useState<NewsItem[]>(() => parseNews(pageData));

  useEffect(() => {
    setItems(parseNews(pageData));
  }, [pageData.id]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      const title = language === "en" ? item.title_en : item.title_ar;
      return title.toLowerCase().includes(q);
    });
  }, [items, search, language]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function commit(next: NewsItem[]) {
    setItems(next);
    onSectionsChange?.(rebuildSections(pageData, next));
  }

  function openAdd() {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(item: NewsItem) {
    setEditingItem(item);
    setForm({ title_en: item.title_en, title_ar: item.title_ar, link_en: item.link_en, link_ar: item.link_ar });
    setShowModal(true);
  }

  function handleDelete(id: number) {
    commit(items.filter((i) => i.id !== id));
  }

  function handleSubmit() {
    if (!form.title_en && !form.title_ar) return;
    let next: NewsItem[];
    if (editingItem) {
      next = items.map((i) => (i.id === editingItem.id ? { ...i, ...form } : i));
    } else {
      next = [{ ...form, id: Date.now() }, ...items];
    }
    commit(next);
    setShowModal(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={openAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span className="text-base leading-none">+</span> Add News
        </button>

        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2 flex-1 min-w-[180px]">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search news"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="text-sm outline-none flex-1 placeholder:text-gray-300 bg-transparent"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {paginated.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-10">No news found.</div>
        ) : (
          paginated.map((item) => {
            const title = language === "en" ? item.title_en : item.title_ar;
            const link = language === "en" ? item.link_en : item.link_ar;
            const fileName = link.split("/").pop() ?? "News";

            return (
              <div
                key={item.id}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-white gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
                    <FileText size={15} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 truncate max-w-[260px]">{title || fileName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fileName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-red-500 text-white text-[8px] font-bold shrink-0">
                      PDF
                    </span>
                    <span className="text-sm text-gray-600 max-w-[120px] truncate hidden sm:block">{fileName}</span>
                  </div>
                  <button
                    onClick={() => openEdit(item)}
                    className="text-sm px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-gray-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
            <h3 className="text-base font-semibold text-gray-800">
              {editingItem ? "Edit News" : "Add News"}
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title (EN)</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                  value={form.title_en}
                  onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
                  placeholder="News title in English"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title (AR)</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                  value={form.title_ar}
                  onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
                  placeholder="عنوان الخبر"
                  dir="rtl"
                />
              </div>
              <PdfUploader label="PDF File (EN)" value={form.link_en} onChange={(url) => setForm((f) => ({ ...f, link_en: url }))} />
              <PdfUploader label="PDF File (AR)" value={form.link_ar} onChange={(url) => setForm((f) => ({ ...f, link_ar: url }))} />
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                {editingItem ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
