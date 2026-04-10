import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { PageData, PageNode, FrameNode, TextNode, Language } from "../types";

const QUESTION_STYLES = {
  lg: { color: "primary", size: "base", weight: "500" },
  sm: { color: "primary", size: "base", weight: "500" },
};
const ANSWER_STYLES = {
  lg: { color: "primary", size: "sm", weight: "400" },
  sm: { color: "primary", size: "sm", weight: "400" },
};
const FAQ_FRAME_STYLES = {
  lg: { gap: 2, margin: "my-3" },
  sm: { gap: 2, margin: "my-3" },
};

interface FAQItem {
  id: number;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  originalFrame: FrameNode;
}

interface Parsed {
  titleFrame: FrameNode | null;
  titleText: { en: string; ar: string } | null;
  items: FAQItem[];
}

function parseItems(pageData: PageData): Parsed {
  const section = pageData.sections?.[0];
  if (section?.type !== "frame") {
    return { titleFrame: null, titleText: null, items: [] };
  }

  const rootChildren = section.params.children ?? [];


  const titleFrame = rootChildren[0]?.type === "frame" ? rootChildren[0] : null;
  const titleTextNode = titleFrame?.params.children?.[0];
  const titleText =
    titleTextNode?.type === "text"
      ? {
          en: titleTextNode.params.content_en ?? titleTextNode.params.content ?? "",
          ar: titleTextNode.params.content_ar ?? titleTextNode.params.content ?? "",
        }
      : null;


  const faqFrames = rootChildren.slice(1).filter((c): c is FrameNode => c.type === "frame");

  const items: FAQItem[] = faqFrames.map((frame, i) => {
    const c = frame.params.children ?? [];
    const q = c[0]?.type === "text" ? c[0] : undefined;
    const a = c[1]?.type === "text" ? c[1] : undefined;
    return {
      id: frame.id ?? i,
      question_en: q?.params.content_en ?? "",
      answer_en: a?.params.content_en ?? "",
      question_ar: q?.params.content_ar ?? "",
      answer_ar: a?.params.content_ar ?? "",
      originalFrame: frame,
    };
  });

  return { titleFrame, titleText, items };
}

function makeTextNode(
  original: PageNode | undefined,
  styles: object,
  content_en: string,
  content_ar: string
): TextNode {
  const base = original?.type === "text" ? original : undefined;
  return {
    id: base?.id,
    key: base?.key ?? "",
    type: "text",
    styles: base?.styles ?? styles,
    params: {
      content_en,
      content_ar,
    },
  };
}

function buildSection(pageData: PageData, parsed: Parsed, titleText: { en: string; ar: string } | null, items: FAQItem[]): PageNode {
  const original = pageData.sections?.[0] as FrameNode;
  const { titleFrame } = parsed;

  
  let newTitleFrame: FrameNode | null = titleFrame ?? null;
  if (titleFrame && titleText) {
    const origTextNode = titleFrame.params.children?.[0];
    const updatedTextNode = makeTextNode(origTextNode, {}, titleText.en, titleText.ar);
    newTitleFrame = {
      ...titleFrame,
      params: { ...titleFrame.params, children: [updatedTextNode] },
    };
  }


  const qaFrames: FrameNode[] = items.map((item) => {
    const orig = item.originalFrame;
    return {
      ...orig,
      params: {
        ...orig.params,
        children: [
          makeTextNode(orig.params.children?.[0], QUESTION_STYLES, item.question_en, item.question_ar),
          makeTextNode(orig.params.children?.[1], ANSWER_STYLES, item.answer_en, item.answer_ar),
        ],
      },
    };
  });

  const newChildren: PageNode[] = newTitleFrame ? [newTitleFrame, ...qaFrames] : qaFrames;

  return { ...original, params: { ...original.params, children: newChildren } };
}

interface FAQTabProps {
  readonly pageData: PageData;
  readonly language: Language;
  readonly onSectionsChange: (sections: PageNode[]) => void;
}

const emptyForm = { question_en: "", question_ar: "", answer_en: "", answer_ar: "" };

export default function FAQTab({ pageData, language, onSectionsChange }: FAQTabProps) {
  const [parsed, setParsed] = useState<Parsed>(() => parseItems(pageData));
  const [titleText, setTitleText] = useState(parsed.titleText);
  const [items, setItems] = useState<FAQItem[]>(parsed.items);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const p = parseItems(pageData);
    setParsed(p);
    setTitleText(p.titleText);
    setItems(p.items);
  }, [pageData.id]);

  function commit(updatedItems: FAQItem[], updatedTitle?: { en: string; ar: string } | null) {
    const newTitle = updatedTitle === undefined ? titleText : updatedTitle;
    setItems(updatedItems);
    onSectionsChange([buildSection(pageData, parsed, newTitle, updatedItems)]);
  }

  function handleTitleChange(field: "en" | "ar", value: string) {
    const updated = { ...(titleText ?? { en: "", ar: "" }), [field]: value };
    setTitleText(updated);
    commit(items, updated);
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
          key: "",
          type: "frame",
          styles: FAQ_FRAME_STYLES,
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

      {titleText !== null && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
          <span className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Page Title</span>
          <div>
            <label htmlFor="faq-title-en" className="text-xs text-gray-400 mb-1 block">Title (EN)</label>
            <input
              id="faq-title-en"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              value={titleText.en}
              onChange={(e) => handleTitleChange("en", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="faq-title-ar" className="text-xs text-gray-400 mb-1 block">Title (AR)</label>
            <input
              id="faq-title-ar"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              value={titleText.ar}
              dir="rtl"
              onChange={(e) => handleTitleChange("ar", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <span className="text-base font-semibold text-gray-800">Questions & Answers</span>
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
            <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50">
                <span className="text-sm font-medium text-gray-800">
                  {item[qKey] || "Untitled Question"}
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="px-5 py-3">
                <p className="text-sm text-gray-500 whitespace-pre-line">{item[aKey] || "—"}</p>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
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
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                value={form.answer_en}
                onChange={(e) => setForm((f) => ({ ...f, answer_en: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Answer (AR)</label>
              <textarea
                rows={4}
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
