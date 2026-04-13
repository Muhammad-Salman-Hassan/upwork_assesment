import { useState, useEffect, useRef } from "react";
import { X, Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { pageService } from "../../services/pageService";
import { fileService } from "../../services/fileService";
import { useToast, ToastContainer } from "../../components/Toast";
import type { PageData, PageNode, FrameNode, TextNode } from "../../types";

interface DisclosureModalProps {
  readonly onClose: () => void;
}

const emptyForm = { title_en: "", title_ar: "", date: "", link_en: "", link_ar: "" };
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
  const [status, setStatus] = useState<UploadStatus>(() => (value ? "done" : "idle"));
  const [fileName, setFileName] = useState<string>(() => value.split("/").pop() ?? "");

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
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 cursor-pointer transition-colors select-none ${status === "done"
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
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

function buildRow(item: typeof emptyForm & { id: number }): PageNode {
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
                params: { content_en: item.date, content_ar: item.date },
              },
            ],
          },
        },
      ],
    },
  };
}

function rebuildSections(pageData: PageData, newRow: PageNode): PageNode[] {
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
      leftFrame?.type === "frame" ? (leftFrame as FrameNode).params.children?.[0] : null;
    if (!leftText || leftText.type !== "text") return true;
    const lp = (leftText as TextNode).params;
    return !lp.link_en && !lp.link_ar;
  });

  const dataRows = existingRows.filter((row) => {
    if (row.type !== "frame") return false;
    const leftFrame = (row as FrameNode).params.children?.[0];
    const leftText =
      leftFrame?.type === "frame" ? (leftFrame as FrameNode).params.children?.[0] : null;
    if (!leftText || leftText.type !== "text") return false;
    const lp = (leftText as TextNode).params;
    return !!(lp.link_en || lp.link_ar);
  });

  const newTableFrame: FrameNode = {
    ...(tableFrame as FrameNode),
    params: {
      ...(tableFrame as FrameNode).params,
      children: [...headerRows, newRow, ...dataRows],
    },
  };

  const newOuterFrame: FrameNode = {
    ...(outerFrame as FrameNode),
    params: {
      ...(outerFrame as FrameNode).params,
      children: [newTableFrame, ...((outerFrame as FrameNode).params.children?.slice(1) ?? [])],
    },
  };

  return [newOuterFrame, ...sections.slice(1)];
}

export default function DisclosureModal({ onClose }: DisclosureModalProps) {
  const { toasts, showToast, dismiss } = useToast();
  const [aboutPage, setAboutPage] = useState<PageData | null>(null);
  const [disclosurePage, setDisclosurePage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    pageService
      .getPage("/about", controller.signal)
      .then((res: any) => {
        const page = res.data?.[0] ?? null;
        setAboutPage(page);
        const corpGov = page?.pages?.find((p: any) => p.slug === "corporate-governance");
        const sub = corpGov?.pages?.find((p: any) => p.slug === "disclosure") ?? null;
        setDisclosurePage(sub);
        if (!sub) setError("Disclosure sub-page not found in /about.");
      })
      .catch((err) => {
        if (err?.code !== "ERR_CANCELED") setError("Failed to load page data.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  async function handleSubmit() {
    if (!aboutPage || !disclosurePage) return;

    const newRow = buildRow({ ...form, id: Date.now() });
    const updatedSections = rebuildSections(disclosurePage, newRow);
    const updatedDisclosure: PageData = { ...disclosurePage, sections: updatedSections };

    const updatedAbout: PageData = {
      ...aboutPage,
      pages: aboutPage.pages?.map((p) => {
        if (p.slug !== "corporate-governance") return p;
        return {
          ...p,
          pages: p.pages?.map((sub) =>
            sub.slug === "disclosure" ? updatedDisclosure : sub
          ),
        };
      }),
    };

    setSaving(true);
    try {
      await pageService.publishVersions(updatedAbout.slug, updatedAbout);
      showToast("success", "Disclosure added successfully.");
      setForm(emptyForm);
      onClose();
    } catch {
      showToast("error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close modal"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm w-full cursor-default"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-gray-800">Add Disclosure</h2>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>


          <div className="px-6 py-5 min-h-[260px] flex flex-col justify-center relative">
            {/* Initial fetch loader */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 size={28} className="animate-spin text-blue-500" />
                <span className="text-sm text-gray-400">Loading…</span>
              </div>
            )}

            {!loading && error && (
              <p className="text-sm text-red-500 text-center py-8">{error}</p>
            )}

            {!loading && !error && (
              <div className="relative">
                {/* Save overlay */}
                {saving && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 rounded-xl">
                    <Loader2 size={26} className="animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500 font-medium">Saving…</span>
                  </div>
                )}

                <div className={`flex flex-col gap-3 transition-opacity ${saving ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                  <div>
                    <label htmlFor="disc-title-en" className="text-xs text-gray-500 mb-1 block">Title (EN)</label>
                    <input
                      id="disc-title-en"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                      value={form.title_en}
                      onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
                      placeholder="Disclosure title in English"
                    />
                  </div>
                  <div>
                    <label htmlFor="disc-title-ar" className="text-xs text-gray-500 mb-1 block">Title (AR)</label>
                    <input
                      id="disc-title-ar"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                      value={form.title_ar}
                      onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
                      placeholder="عنوان الإفصاح"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label htmlFor="disc-date" className="text-xs text-gray-500 mb-1 block">Date (DD/MM/YYYY)</label>
                    <input
                      id="disc-date"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
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
              </div>
            )}
          </div>

          {!loading && !error && (
            <div className="flex gap-3 justify-end px-6 pb-5">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving…" : "Add"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
