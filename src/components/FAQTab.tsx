import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { PageData, PageNode, FrameNode, TextNode, Language } from "../types";

interface FAQItem {
  id: number;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  originalFrame: FrameNode;
}

function parseItems(pageData: PageData): { titleFrame: FrameNode | null; items: FAQItem[] } {
  const section = pageData.sections?.[0];
  if (!section || section.type !== "frame") return { titleFrame: null, items: [] };

  const children = (section as FrameNode).params.children ?? [];
  const titleFrame = children[0]?.type === "frame" ? (children[0] as FrameNode) : null;
  const qaFrames = children.slice(1);

  const items: FAQItem[] = qaFrames
    .filter((c) => c.type === "frame")
    .map((frame, i) => {
      const f = frame as FrameNode;
      const q = f.params.children?.[0] as TextNode | undefined;
      const a = f.params.children?.[1] as TextNode | undefined;
      return {
        id: frame.id ?? i,
        question_en: String(q?.params.content_en ?? q?.params.content ?? ""),
        question_ar: String(q?.params.content_ar ?? q?.params.content ?? ""),
        answer_en: String(a?.params.content_en ?? a?.params.content ?? ""),
        answer_ar: String(a?.params.content_ar ?? a?.params.content ?? ""),
        originalFrame: f,
      };
    });

  return { titleFrame, items };
}

function buildSection(pageData: PageData, titleFrame: FrameNode | null, items: FAQItem[]): PageNode {
  const original = pageData.sections?.[0] as FrameNode;

  const qaFrames: FrameNode[] = items.map((item) => ({
    ...item.originalFrame,
    params: {
      ...item.originalFrame.params,
      children: [
        {
          ...(item.originalFrame.params.children?.[0] ?? { key: "", styles: {}, type: "text" as const }),
          type: "text" as const,
          params: {
            ...(item.originalFrame.params.children?.[0] as TextNode)?.params,
            content_en: item.question_en,
            content_ar: item.question_ar,
            content: item.question_en,
          },
        },
        {
          ...(item.originalFrame.params.children?.[1] ?? { key: "", styles: {}, type: "text" as const }),
          type: "text" as const,
          params: {
            ...(item.originalFrame.params.children?.[1] as TextNode)?.params,
            content_en: item.answer_en,
            content_ar: item.answer_ar,
            content: item.answer_en,
          },
        },
      ],
    },
  }));

  const newChildren: PageNode[] = titleFrame ? [titleFrame, ...qaFrames] : qaFrames;

  return {
    ...original,
    params: { ...original.params, children: newChildren },
  };
}

interface FAQTabProps {
  readonly pageData: PageData;
  readonly language: Language;
  readonly onSectionsChange: (sections: PageNode[]) => void;
}

const emptyForm = { question_en: "", question_ar: "", answer_en: "", answer_ar: "" };

export default function FAQTab({ pageData, language, onSectionsChange }: FAQTabProps) {
  const { titleFrame, items: parsed } = parseItems(pageData);
  const [items, setItems] = useState<FAQItem[]>(parsed);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setItems(parseItems(pageData).items);
  }, [pageData.id]);

  function commit(updated: FAQItem[]) {
    setItems(updated);
    onSectionsChange([buildSection(pageData, titleFrame, updated)]);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(item: FAQItem) {
    setEditing(item);
    setForm({
      question_en: item.question_en,
      question_ar: item.question_ar,
      answer_en: item.answer_en,
      answer_ar: item.answer_ar,
    });
    setShowModal(true);
  }

  function handleDelete(id: number) {
    commit(items.filter((i) => i.id !== id));
  }

  function handleSubmit() {
    if (editing) {
      commit(items.map((i) => (i.id === editing.id ? { ...i, ...form } : i)));
    } else {
      const newItem: FAQItem = {
        ...form,
        id: Date.now(),
        originalFrame: {
          type: "frame",
          key: "",
          styles: { lg: { gap: 2, margin: "my-3" }, sm: { gap: 2, margin: "my-3" } },
          params: { children: [] },
        },
      };
      commit([...items, newItem]);
    }
    setShowModal(false);
  }

  const qKey = language === "en" ? "question_en" : "question_ar";
  const aKey = language === "en" ? "answer_en" : "answer_ar";

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <span className="text-base font-semibold text-gray-800">Edit Questions</span>
          <button
            onClick={openAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span> Add Question
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {items.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-6">
              No questions yet. Click "+ Add Question" to add one.
            </div>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-xl overflow-hidden "
            >
              <div className="flex items-center justify-between px-5 py-3 bg-gray-100">
                <span className="text-sm font-medium text-gray-800">
                  {item[qKey] || "Untitled Question"}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="px-5 py-3">
                <p className="text-sm text-gray-500 whitespace-pre-line">
                  {item[aKey] || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-gray-800">
              {editing ? "Edit Question" : "Add Question"}
            </h3>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Question (EN)</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.question_en}
                onChange={(e) => setForm((f) => ({ ...f, question_en: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Question (AR)</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.question_ar}
                dir="rtl"
                onChange={(e) => setForm((f) => ({ ...f, question_ar: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Answer (EN)</label>
              <textarea
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                value={form.answer_en}
                onChange={(e) => setForm((f) => ({ ...f, answer_en: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Answer (AR)</label>
              <textarea
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                value={form.answer_ar}
                dir="rtl"
                onChange={(e) => setForm((f) => ({ ...f, answer_ar: e.target.value }))}
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
                {editing ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
