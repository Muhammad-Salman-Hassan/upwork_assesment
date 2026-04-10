import { useState, useMemo, useEffect, useRef } from "react";
import {
  FileText, Search, ChevronLeft, ChevronRight,
  UploadCloud, X, CheckCircle2, Loader2,
} from "lucide-react";
import type { PageData, Language, FrameNode, TextNode, PageNode } from "../types";
import { fileService } from "../services/fileService";

interface FinancialReportItem {
  id: number;
  title_en: string;
  title_ar: string;
  year: string;
  link_en: string;
  link_ar: string;
}

interface FinancialReportsTabProps {
  readonly pageData: PageData;
  readonly language: Language;
  readonly onSectionsChange?: (sections: PageNode[]) => void;
}

type UploadStatus = "idle" | "uploading" | "done" | "error";

const emptyForm = { title_en: "", title_ar: "", year: "", link_en: "", link_ar: "" };
const PAGE_SIZE = 8;

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

function findLinkText(node: PageNode): TextNode | null {
  if (node.type === "text") {
    const p = (node as TextNode).params;
    if (p.link_en || p.link_ar) return node as TextNode;
  }
  if (node.type === "frame") {
    for (const child of (node as FrameNode).params.children ?? []) {
      const found = findLinkText(child);
      if (found) return found;
    }
  }
  return null;
}

function extractYear(text: string): string {
  return text.match(/\d{4}/)?.[0] ?? "";
}

function parseReports(pageData: PageData): FinancialReportItem[] {
  try {
    const outer = pageData.sections?.[0];
    if (!outer || outer.type !== "frame") return [];

    const colsFrame = (outer as FrameNode).params.children?.[1];
    if (!colsFrame || colsFrame.type !== "frame") return [];

    const items: FinancialReportItem[] = [];

    for (const col of (colsFrame as FrameNode).params.children ?? []) {
      if (col.type !== "frame") continue;
      const colFrame = col as FrameNode;

      const yearTitleFrame = colFrame.params.children?.[0];
      const yearText =
        yearTitleFrame?.type === "frame"
          ? ((yearTitleFrame as FrameNode).params.children?.[0] as TextNode | undefined)
          : null;
      const year = yearText?.type === "text"
        ? extractYear(String(yearText.params.content_en ?? ""))
        : "";
      if (!year) continue;

      const listFrame = colFrame.params.children?.[1];
      if (!listFrame || listFrame.type !== "frame") continue;

      for (const node of (listFrame as FrameNode).params.children ?? []) {
        const text = findLinkText(node);
        if (!text) continue;
        items.push({
          id: node.id ?? text.id ?? Date.now() + Math.random(),
          title_en: String(text.params.content_en ?? ""),
          title_ar: String(text.params.content_ar ?? ""),
          year,
          link_en: String(text.params.link_en ?? ""),
          link_ar: String(text.params.link_ar ?? ""),
        });
      }
    }

    return items;
  } catch {
    return [];
  }
}

const ITEM_TEXT_STYLES = {
  lg: { align: "left", color: "secondary", size: "base", underline: false, weight: "400" },
  sm: { align: "left", color: "secondary", size: "base", underline: false, weight: "400" },
};

const YEAR_TITLE_STYLES = {
  lg: { align: "left", color: "primary", size: "lg", underline: false, weight: "400" },
  sm: { align: "left", color: "primary", size: "lg", underline: false, weight: "400" },
};

function buildYearColumn(year: string, yearItems: FinancialReportItem[], original?: FrameNode): FrameNode {
  const base: FrameNode = original ?? {
    styles: {
      lg: { background: "primary", gap: 5, minWidth: 200, orientation: "vertical", padding: "px-5 py-4", radius: "lg", width: 25 },
      sm: { background: "primary", gap: 5, minWidth: 200, orientation: "vertical", padding: "px-5 py-4", radius: "lg", width: 100 },
    },
    type: "frame",
    params: { children: [] },
  };

  const titleFrame: FrameNode = {
    styles: { lg: { justify: "center", padding: "px-0 py-2" }, sm: { justify: "center", padding: "px-0 py-2" } },
    type: "frame",
    params: {
      children: [{
        styles: YEAR_TITLE_STYLES,
        type: "text",
        params: { content_en: `Financial Report ${year}`, content_ar: `تقرير مالي ${year}` },
      }],
    },
  };

  const listFrame: FrameNode = {
    styles: { lg: { gap: 3 } },
    type: "frame",
    params: {
      children: yearItems.map((item): PageNode => ({
        id: item.id,
        key: "financial-reports",
        styles: ITEM_TEXT_STYLES,
        type: "text",
        params: { content_en: item.title_en, content_ar: item.title_ar, link_en: item.link_en, link_ar: item.link_ar },
      })),
    },
  };

  return { ...base, params: { ...base.params, children: [titleFrame, listFrame] } };
}

function rebuildSections(pageData: PageData, items: FinancialReportItem[]): PageNode[] {
  const sections = pageData.sections ?? [];
  const outer = sections[0];
  if (!outer || outer.type !== "frame") return sections;

  const colsFrame = (outer as FrameNode).params.children?.[1];
  if (!colsFrame || colsFrame.type !== "frame") return sections;


  const originalByYear = new Map<string, FrameNode>();
  for (const col of (colsFrame as FrameNode).params.children ?? []) {
    if (col.type !== "frame") continue;
    const yearText = ((col as FrameNode).params.children?.[0] as FrameNode | undefined)
      ?.params.children?.[0] as TextNode | undefined;
    if (yearText?.type === "text") {
      const y = extractYear(String(yearText.params.content_en ?? ""));
      if (y) originalByYear.set(y, col as FrameNode);
    }
  }

  const yearOrder: string[] = [];
  const byYear = new Map<string, FinancialReportItem[]>();
  for (const item of items) {
    if (!byYear.has(item.year)) { byYear.set(item.year, []); yearOrder.push(item.year); }
    byYear.get(item.year)!.push(item);
  }

  yearOrder.sort((a, b) => b.localeCompare(a));

  const newCols = yearOrder.map((year) =>
    buildYearColumn(year, byYear.get(year) ?? [], originalByYear.get(year))
  );

  const newColsFrame: FrameNode = {
    ...(colsFrame as FrameNode),
    params: { ...(colsFrame as FrameNode).params, children: newCols },
  };

  const outerChildren = (outer as FrameNode).params.children;
  const newOuter: FrameNode = {
    ...(outer as FrameNode),
    params: {
      ...(outer as FrameNode).params,
      children: [outerChildren[0], newColsFrame, ...outerChildren.slice(2)],
    },
  };

  return [newOuter, ...sections.slice(1)];
}

export default function FinancialReportsTab({ pageData, language, onSectionsChange }: FinancialReportsTabProps) {
  const [items, setItems] = useState<FinancialReportItem[]>(() => parseReports(pageData));

  useEffect(() => {
    setItems(parseReports(pageData));
  }, [pageData.id]);

  const [selectedYear, setSelectedYear] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FinancialReportItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const years = useMemo(() => {
    const set = new Set(items.map((i) => i.year).filter(Boolean));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const title = language === "en" ? item.title_en : item.title_ar;
      const yearMatch = selectedYear === "all" || item.year === selectedYear;
      const searchMatch = !search || title.toLowerCase().includes(search.toLowerCase());
      return yearMatch && searchMatch;
    });
  }, [items, selectedYear, search, language]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function commit(next: FinancialReportItem[]) {
    setItems(next);
    onSectionsChange?.(rebuildSections(pageData, next));
  }

  function openAdd() {
    setEditingItem(null);
    setForm({ ...emptyForm, year: years[0] ?? "" });
    setShowModal(true);
  }

  function openEdit(item: FinancialReportItem) {
    setEditingItem(item);
    setForm({ title_en: item.title_en, title_ar: item.title_ar, year: item.year, link_en: item.link_en, link_ar: item.link_ar });
    setShowModal(true);
  }

  function handleDelete(id: number) {
    commit(items.filter((i) => i.id !== id));
  }

  function handleSubmit() {
    if (!form.title_en && !form.title_ar) return;
    let next: FinancialReportItem[];
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
          <span className="text-base leading-none">+</span> Add Report
        </button>

        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <span className="text-xs text-gray-500 px-3 py-2 bg-gray-50 border-r border-gray-200 select-none">Year</span>
          <select
            value={selectedYear}
            onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
            className="text-sm text-gray-700 px-3 py-2 outline-none bg-white"
          >
            <option value="all">All</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2 flex-1 min-w-[180px]">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search reports"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="text-sm outline-none flex-1 placeholder:text-gray-300 bg-transparent"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {paginated.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-10">No reports found.</div>
        ) : (
          paginated.map((item) => {
            const title = language === "en" ? item.title_en : item.title_ar;
            const link = language === "en" ? item.link_en : item.link_ar;
            const fileName = link.split("/").pop() ?? "Report";

            return (
              <div
                key={item.id}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-white gap-4"
              >
                <div className="flex items-center gap-3  min-w-16 flex-1">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
                    <FileText size={15} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 truncate max-w-[260px]">{title || fileName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.year}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span onClick={() => window.open(link, "_blank")} className="inline-flex items-center justify-center w-7 h-7 rounded bg-red-500 text-white text-[8px] font-bold shrink-0 cursor-pointer">
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
              {editingItem ? "Edit Report" : "Add Report"}
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title (EN)</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                  value={form.title_en}
                  onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
                  placeholder="e.g. Quarterly Report 1 - 2025"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title (AR)</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                  value={form.title_ar}
                  onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
                  placeholder="مثال: التقرير الفصلي 1 - 2025"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Year</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                  placeholder="e.g. 2025"
                  maxLength={4}
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
