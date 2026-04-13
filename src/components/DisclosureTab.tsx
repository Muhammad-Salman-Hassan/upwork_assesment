import { useState, useMemo, useEffect, useRef } from "react";
import { FileText, Search, ChevronLeft, ChevronRight, UploadCloud, X, CheckCircle2, Loader2 } from "lucide-react";
import type { PageData, Language, FrameNode, TextNode, PageNode } from "../types";
import { fileService } from "../services/fileService";

interface DisclosureItem {
  id: number;
  title_en: string;
  title_ar: string;
  date: string;
  link_en: string;
  link_ar: string;
}

interface DisclosureTabProps {
  readonly pageData: PageData;
  readonly language: Language;
  readonly onSectionsChange?: (sections: PageNode[]) => void;
}

const emptyForm = {
  title_en: "",
  title_ar: "",
  date: "",
  link_en: "",
  link_ar: "",
};

type UploadStatus = "idle" | "uploading" | "done" | "error";

function PdfUploader({
  label,
  value,
  onChange,
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
    if (!file) return;
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

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
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

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-gray-500">{label}</span>

      <div
        onClick={() => status !== "uploading" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 cursor-pointer transition-colors select-none ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : status === "done"
            ? "border-green-300 bg-green-50"
            : status === "error"
            ? "border-red-300 bg-red-50"
            : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
        }`}
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
              <p className="text-xs font-medium text-gray-600">
                Drop PDF here or <span className="text-blue-500">browse</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">PDF files only</p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}

function parseDisclosures(pageData: PageData): DisclosureItem[] {
  try {
    const outerFrame = pageData.sections?.[0];
    if (!outerFrame || outerFrame.type !== "frame") return [];

    const tableFrame = (outerFrame as FrameNode).params.children?.[0];
    if (!tableFrame || tableFrame.type !== "frame") return [];

    const rows = (tableFrame as FrameNode).params.children ?? [];
    const items: DisclosureItem[] = [];

    for (const row of rows) {
      if (row.type !== "frame") continue;
      const rowFrame = row as FrameNode;
      const leftFrame = rowFrame.params.children?.[0];
      const rightFrame = rowFrame.params.children?.[1];
      if (!leftFrame || !rightFrame) continue;

      const leftText =
        leftFrame.type === "frame"
          ? (leftFrame as FrameNode).params.children?.[0]
          : null;
      const rightText =
        rightFrame.type === "frame"
          ? (rightFrame as FrameNode).params.children?.[0]
          : null;

      if (!leftText || leftText.type !== "text") continue;
      const lp = (leftText as TextNode).params;
    
      if (!lp.link_en && !lp.link_ar) continue;

      const date =
        rightText?.type === "text"
          ? String((rightText as TextNode).params.content_en ?? "")
          : "";

      items.push({
        id: row.id ?? Math.random(),
        title_en: String(lp.content_en ?? ""),
        title_ar: String(lp.content_ar ?? ""),
        date: date.trim(),
        link_en: String(lp.link_en ?? ""),
        link_ar: String(lp.link_ar ?? ""),
      });
    }

    return items;
  } catch {
    return [];
  }
}

const PAGE_SIZE = 8;

function buildRow(item: DisclosureItem): PageNode {
  return {
    id: item.id,
    styles: {},
    type: "frame",
    params: {
      children: [
        {
          type: "frame",
          styles: {},
          params: {
            children: [
              {
                type: "text",
                styles: {},
                params: {
                  content_en: item.title_en,
                  content_ar: item.title_ar,
                  link_en: item.link_en,
                  link_ar: item.link_ar,
                },
              },
            ],
          },
        },
        {
          type: "frame",
          styles: {},
          params: {
            children: [
              {
                type: "text",
                styles: {},
                params: {
                  content_en: item.date,
                  content_ar: item.date,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function rebuildSections(pageData: PageData, items: DisclosureItem[]): PageNode[] {
  const sections = pageData.sections ?? [];
  const outerFrame = sections[0];
  if (!outerFrame || outerFrame.type !== "frame") return sections;

  const tableFrame = (outerFrame as FrameNode).params.children?.[0];
  if (!tableFrame || tableFrame.type !== "frame") return sections;

 
  const existingRows = (tableFrame as FrameNode).params.children ?? [];
  const headerRows = existingRows.filter((row) => {
    if (row.type !== "frame") return true;
    const leftFrame = (row as FrameNode).params.children?.[0];
    const leftText =
      leftFrame?.type === "frame"
        ? (leftFrame as FrameNode).params.children?.[0]
        : null;
    if (!leftText || leftText.type !== "text") return true;
    const lp = (leftText as TextNode).params;
    return !lp.link_en && !lp.link_ar;
  });

  const newTableFrame: FrameNode = {
    ...(tableFrame as FrameNode),
    params: {
      ...(tableFrame as FrameNode).params,
      children: [...headerRows, ...items.map(buildRow)],
    },
  };

  const newOuterFrame: FrameNode = {
    ...(outerFrame as FrameNode),
    params: {
      ...(outerFrame as FrameNode).params,
      children: [
        newTableFrame,
        ...((outerFrame as FrameNode).params.children?.slice(1) ?? []),
      ],
    },
  };

  return [newOuterFrame, ...sections.slice(1)];
}

export default function DisclosureTab({
  pageData,
  language,
  onSectionsChange,
}: DisclosureTabProps) {
  const [items, setItems] = useState<DisclosureItem[]>(() =>
    parseDisclosures(pageData)
  );

  
  useEffect(() => {
    setItems(parseDisclosures(pageData));
  }, [pageData.id]);

  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DisclosureItem | null>(null);
  const [form, setForm] = useState(emptyForm);


  const years = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      const parts = item.date.split("/");
      const year = parts[2]?.trim();
      if (year && /^\d{4}$/.test(year)) set.add(year);
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const title = language === "en" ? item.title_en : item.title_ar;
      const year = item.date.split("/")[2]?.trim();
      const yearMatch = selectedYear === "all" || year === selectedYear;
      const searchMatch =
        !search || title.toLowerCase().includes(search.toLowerCase());
      return yearMatch && searchMatch;
    });
  }, [items, selectedYear, search, language]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAdd() {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(item: DisclosureItem) {
    setEditingItem(item);
    setForm({
      title_en: item.title_en,
      title_ar: item.title_ar,
      date: item.date,
      link_en: item.link_en,
      link_ar: item.link_ar,
    });
    setShowModal(true);
  }

  function handleDelete(id: number) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    onSectionsChange?.(rebuildSections(pageData, next));
  }

  function handleSubmit() {
    let next: DisclosureItem[];
    if (editingItem) {
      next = items.map((i) => (i.id === editingItem.id ? { ...i, ...form } : i));
    } else {
      next = [{ ...form, id: Date.now() }, ...items];
    }
    setItems(next);
    onSectionsChange?.(rebuildSections(pageData, next));
    setShowModal(false);
  }

  return (
    <div className="flex flex-col gap-4">
   
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={openAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span className="text-base leading-none">+</span> Add Disclosure
        </button>

       
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <span className="text-xs text-gray-500 px-3 py-2 bg-gray-50 border-r border-gray-200 select-none">
            Year
          </span>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(1);
            }}
            className="text-sm text-gray-700 px-3 py-2 outline-none bg-white"
          >
            <option value="all">All</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

     
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2 flex-1 min-w-[180px]">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search disclosure"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="text-sm outline-none flex-1 placeholder:text-gray-300 bg-transparent"
          />
        </div>
      </div>


      <div className="flex flex-col gap-2">
        {paginated.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-10">
            No disclosures found.
          </div>
        ) : (
          paginated.map((item) => {
            const title = language === "en" ? item.title_en : item.title_ar;
            const link = language === "en" ? item.link_en : item.link_ar;
            const fileName = link.split("/").pop() ?? "Disclosure";

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
                    <p className="text-sm text-gray-700 truncate max-w-[260px]">
                      {title || fileName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                  </div>
                </div>

          
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span onClick={() => window.open(link, "_blank")}  className="inline-flex items-center justify-center w-7 h-7 rounded bg-red-500 text-white text-[8px] font-bold shrink-0 cursor-pointer" >
                      PDF
                    </span>
                    <span className="text-sm text-gray-600 max-w-[120px] truncate hidden sm:block">
                      {fileName}
                    </span>
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

  
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
            <h3 className="text-base font-semibold text-gray-800">
              {editingItem ? "Edit Disclosure" : "Add Disclosure"}
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Title (EN)
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                  value={form.title_en}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title_en: e.target.value }))
                  }
                  placeholder="Disclosure title in English"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Title (AR)
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                  value={form.title_ar}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title_ar: e.target.value }))
                  }
                  placeholder="عنوان الإفصاح"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Date (DD/MM/YYYY)
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  placeholder="03/03/2026"
                />
              </div>
              <PdfUploader
                label="PDF File (EN)"
                value={form.link_en}
                onChange={(url) => setForm((f) => ({ ...f, link_en: url }))}
              />
              <PdfUploader
                label="PDF File (AR)"
                value={form.link_ar}
                onChange={(url) => setForm((f) => ({ ...f, link_ar: url }))}
              />
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
