import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "../../components/Layout";
import { ToastContainer, useToast } from "../../components/Toast";
import ImageField from "../../components/fields/ImageField";
import { pageService } from "../../services/pageService";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "en" | "ar";

interface FormFields {
  titleEn: string;
  titleAr: string;
  slug: string;
  products: string;
  tags: string;
  preview: string;
  bannerSrcEn: string;
  bannerSrcAr: string;
  headingEn: string;
  headingAr: string;
  descEn: string;
  descAr: string;
  titleBarEn: string;
  titleBarAr: string;
  offerLabelEn: string;
  offerLabelAr: string;
  expiryEn: string;
  expiryAr: string;
  ctaLabelEn: string;
  ctaLabelAr: string;
  ctaLinkEn: string;
  ctaLinkAr: string;
}


function buildSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function buildPayload(f: FormFields) {
  return {
    order: 0,
    slug: f.slug,
    path: `/${f.slug}`,
    title_ar: f.titleAr,
    title_en: f.titleEn,
    type: "content",
    parent_id: 0,
    status: "",
    meta: {
      preview: f.preview,
      products: f.products,
      tags: f.tags,
    },
    styles: {
      lg: { background: "primary", padding: "px-0 py-2" },
      sm: { background: "primary", padding: "px-2 py-2" },
    },
    sections: [
      {
        key: "",
        type: "frame",
        styles: {
          lg: { gap: 8, grow: true, justify: "between", orientation: "vertical", padding: "px-12 py-4", radius: "3xl", width: "100" },
          sm: { gap: 5, grow: true, justify: "between", orientation: "vertical", padding: "px-2 py-0", radius: "xl", width: "100" },
        },
        params: {
          children: [
            {
              key: "",
              type: "frame",
              styles: {
                lg: { grow: true, justify: "between", orientation: "vertical", width: "100" },
                sm: { grow: true, justify: "between", orientation: "vertical", width: "100" },
              },
              params: {
                children: [
                  {
                    key: "offer-image",
                    type: "image",
                    styles: {
                      lg: { height: "h-[500px]", radius: "3xl", width: "100" },
                      sm: { height: "h-[300px]", radius: "xl", width: "100" },
                    },
                    params: { alt: "offer_banner", src_ar: f.bannerSrcAr, src_en: f.bannerSrcEn },
                  },
                ],
              },
            },
            {
              key: "",
              type: "frame",
              styles: {
                lg: { gap: 8, grow: true, orientation: "vertical", width: "100" },
                sm: { gap: 5, grow: true, orientation: "vertical", width: "100" },
              },
              params: {
                children: [
                  {
                    key: "offer-text",
                    type: "text",
                    styles: {
                      lg: { align: "left", color: "primary", size: "lg", underline: false, weight: "500" },
                      sm: { align: "left", color: "primary", size: "base", underline: false, weight: "500" },
                    },
                    params: { content_ar: f.headingAr, content_en: f.headingEn },
                  },
                  {
                    key: "",
                    type: "frame",
                    styles: { lg: { gap: 2 }, sm: { gap: 2 } },
                    params: {
                      children: [
                        {
                          key: "offer-text",
                          type: "text",
                          styles: {
                            lg: { align: "left", color: "primary", size: "base", underline: false, weight: "300" },
                            sm: { align: "left", color: "primary", size: "sm", underline: false, weight: "300" },
                          },
                          params: { content_ar: f.descAr, content_en: f.descEn },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              key: "",
              type: "frame",
              styles: {
                lg: { background: "secondary", gap: 8, justify: "between", orientation: "horizontal", padding: "px-10 py-4", radius: "3xl", width: "100" },
                sm: { align: "center", background: "secondary", gap: 5, justify: "between", orientation: "horizontal", padding: "px-3 py-1.5", radius: "xl", width: "100" },
              },
              params: {
                children: [
                  {
                    key: "",
                    type: "frame",
                    styles: { lg: { gap: 2 }, sm: { gap: 0 } },
                    params: {
                      children: [
                        {
                          key: "offer-title",
                          type: "text",
                          styles: {
                            lg: { align: "left", color: "primary", size: "lg", underline: false, weight: "700" },
                            sm: { align: "left", color: "primary", size: "base", underline: false, weight: "700" },
                          },
                          params: { content_ar: f.titleBarAr, content_en: f.titleBarEn },
                        },
                        {
                          key: "offer-label",
                          type: "text",
                          styles: {
                            lg: { align: "left", color: "primary", size: "base", underline: false, weight: "500" },
                            sm: { align: "left", color: "primary", size: "sm", underline: false, weight: "500" },
                          },
                          params: { content_ar: f.offerLabelAr, content_en: f.offerLabelEn },
                        },
                        {
                          key: "offer-date",
                          type: "text",
                          styles: {
                            lg: { align: "left", color: "primary", size: "sm", underline: false, weight: "400" },
                            sm: { align: "left", color: "primary", size: "xs", underline: false, weight: "400" },
                          },
                          params: { content_ar: f.expiryAr, content_en: f.expiryEn },
                        },
                      ],
                    },
                  },
                  {
                    key: "",
                    type: "button",
                    styles: {
                      lg: { background: "brand", color: "invert", height: "10", margin: "my-1", padding: "px-4 py-3", radius: "md", textSize: "sm", textWeight: "400" },
                      sm: { background: "brand", color: "invert", height: "10", margin: "my-0", padding: "px-3 py-2", radius: "md", textSize: "sm", textWeight: "400" },
                    },
                    params: {
                      cta: {
                        label_ar: f.ctaLabelAr,
                        label_en: f.ctaLabelEn,
                        link_ar: f.ctaLinkAr,
                        link_en: f.ctaLinkEn,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };
}


const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">{children}</div>
    </div>
  );
}


function CreateRightBar({
  saving, onSave, titleEn, slug,
  products, tags, preview,
  onProductsChange, onTagsChange, onPreviewChange,
}: {
  saving: boolean;
  onSave: () => void;
  titleEn: string;
  slug: string;
  products: string;
  tags: string;
  preview: string;
  onProductsChange: (v: string) => void;
  onTagsChange: (v: string) => void;
  onPreviewChange: (v: string) => void;
}) {
  return (
    <div className="w-64 bg-white flex flex-col p-4 gap-4 h-full border-l border-gray-100">
      <div>
        <h2 className="text-base font-semibold text-gray-800">New Offer Page</h2>
        <p className="text-xs text-gray-400 mt-0.5">Fill in the details and publish</p>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Slug</span>
          <span className="font-mono text-xs text-blue-500 bg-blue-50 rounded px-2 py-1 truncate">
            /{slug || "…"}
          </span>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Product ID</span>
          <input value={products} onChange={(e) => onProductsChange(e.target.value)}
            className={inputCls} placeholder="97" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Tags</span>
          <input value={tags} onChange={(e) => onTagsChange(e.target.value)}
            className={inputCls} placeholder="ads" />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Preview Image</span>
          <ImageField src={preview} onImageChange={onPreviewChange} />
        </div>

        {titleEn && (
          <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Page title</p>
            <p className="text-sm font-medium text-gray-700 truncate">{titleEn}</p>
          </div>
        )}
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors w-full mt-auto"
      >
        {saving ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Creating…
          </>
        ) : (
          "Create & Publish"
        )}
      </button>
    </div>
  );
}


export default function CreateOffer() {
  const navigate = useNavigate();
  const { toasts, showToast, dismiss } = useToast();
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const [f, setF] = useState<FormFields>({
    titleEn: "",
    titleAr: "",
    slug: "",
    products: "",
    tags: "ads",
    preview: "",
    bannerSrcEn: "",
    bannerSrcAr: "",
    headingEn: "",
    headingAr: "",
    descEn: "",
    descAr: "",
    titleBarEn: "",
    titleBarAr: "",
    offerLabelEn: "",
    offerLabelAr: "",
    expiryEn: "",
    expiryAr: "",
    ctaLabelEn: "Calculate",
    ctaLabelAr: "الحاسبة",
    ctaLinkEn: "",
    ctaLinkAr: "",
  });

  function set<K extends keyof FormFields>(key: K, value: string) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleEnChange(val: string) {
    setF((prev) => ({ ...prev, titleEn: val, slug: buildSlug(val) }));
  }

  const isEn = lang === "en";

  async function handleSave() {
    if (!f.titleEn || !f.slug) {
      showToast("error", "Title (EN) and slug are required.");
      return;
    }
    setSaving(true);
    try {
      await pageService.createPage(buildPayload(f));
      showToast("success", "Offer page created successfully.");
      setTimeout(() => navigate(-1), 1500);
    } catch {
      showToast("error", "Failed to create page. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const rightBar = (
    <CreateRightBar
      saving={saving}
      onSave={handleSave}
      titleEn={f.titleEn}
      slug={f.slug}
      products={f.products}
      tags={f.tags}
      preview={f.preview}
      onProductsChange={(v) => set("products", v)}
      onTagsChange={(v) => set("tags", v)}
      onPreviewChange={(v) => set("preview", v)}
    />
  );

  return (
    <>
      <Layout rightBar={rightBar}>
       
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-500">Create Offer Page</span>
          <button
            onClick={() => navigate(-1)}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        </div>

      
        <div className="flex gap-2 mb-5 border-b border-gray-200">
          {(["en", "ar"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                lang === l
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {l === "en" ? "English" : "Arabic"}
            </button>
          ))}
        </div>

       
        <div className="flex flex-col gap-4">

   
          <SectionCard title="Page Identity">
            <Field label="Title (EN)" required>
              <input
                value={f.titleEn}
                onChange={(e) => handleTitleEnChange(e.target.value)}
                className={inputCls}
                placeholder="Test Offer"
              />
            </Field>
            <Field label="Title (AR)" required>
              <input
                value={f.titleAr}
                onChange={(e) => set("titleAr", e.target.value)}
                className={inputCls}
                placeholder="عروض مدرسية"
                dir="rtl"
              />
            </Field>
          </SectionCard>

          <SectionCard title="Banner Image">
            <div className="col-span-1 flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Banner (EN)</span>
              <ImageField
                src={f.bannerSrcEn}
                onImageChange={(url) => set("bannerSrcEn", url)}
              />
            </div>
            <div className="col-span-1 flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Banner (AR)</span>
              <ImageField
                src={f.bannerSrcAr}
                onImageChange={(url) => set("bannerSrcAr", url)}
              />
            </div>
          </SectionCard>

        
          <SectionCard title="Heading & Description">
            <Field label={`Heading (${lang.toUpperCase()})`}>
              <input
                value={isEn ? f.headingEn : f.headingAr}
                onChange={(e) => set(isEn ? "headingEn" : "headingAr", e.target.value)}
                className={inputCls}
                placeholder={isEn ? "Enjoy our education loan offer today" : "اختر الأفضل لأبنائك معنا"}
                dir={isEn ? "ltr" : "rtl"}
              />
            </Field>
            <Field label={`Description (${lang.toUpperCase()})`}>
              <input
                value={isEn ? f.descEn : f.descAr}
                onChange={(e) => set(isEn ? "descEn" : "descAr", e.target.value)}
                className={inputCls}
                placeholder={isEn ? "We offer you a 10% discount…" : "خصم 10% على…"}
                dir={isEn ? "ltr" : "rtl"}
              />
            </Field>
          </SectionCard>

      
          <SectionCard title="Info Bar">
            <Field label={`Bar Title (${lang.toUpperCase()})`}>
              <input
                value={isEn ? f.titleBarEn : f.titleBarAr}
                onChange={(e) => set(isEn ? "titleBarEn" : "titleBarAr", e.target.value)}
                className={inputCls}
                placeholder={isEn ? "School Offers" : "عروض مدرسية"}
                dir={isEn ? "ltr" : "rtl"}
              />
            </Field>
            <Field label={`Offer Label (${lang.toUpperCase()})`}>
              <input
                value={isEn ? f.offerLabelEn : f.offerLabelAr}
                onChange={(e) => set(isEn ? "offerLabelEn" : "offerLabelAr", e.target.value)}
                className={inputCls}
                placeholder={isEn ? "10% discount on education loan" : "خصم 10%"}
                dir={isEn ? "ltr" : "rtl"}
              />
            </Field>
            <Field label={`Expiry Date (${lang.toUpperCase()})`}>
              <input
                value={isEn ? f.expiryEn : f.expiryAr}
                onChange={(e) => set(isEn ? "expiryEn" : "expiryAr", e.target.value)}
                className={inputCls}
                placeholder={isEn ? "30 April 2026" : "30 أبريل 2026"}
                dir={isEn ? "ltr" : "rtl"}
              />
            </Field>
          </SectionCard>

         
          <SectionCard title="CTA Button">
            <Field label={`Label (${lang.toUpperCase()})`}>
              <input
                value={isEn ? f.ctaLabelEn : f.ctaLabelAr}
                onChange={(e) => set(isEn ? "ctaLabelEn" : "ctaLabelAr", e.target.value)}
                className={inputCls}
                placeholder={isEn ? "Calculate" : "الحاسبة"}
                dir={isEn ? "ltr" : "rtl"}
              />
            </Field>
            <Field label={`Link (${lang.toUpperCase()})`}>
              <input
                value={isEn ? f.ctaLinkEn : f.ctaLinkAr}
                onChange={(e) => set(isEn ? "ctaLinkEn" : "ctaLinkAr", e.target.value)}
                className={inputCls}
                placeholder={isEn ? "/calculate/97" : "ar/calculate/97"}
                dir="ltr"
              />
            </Field>
          </SectionCard>

        </div>
      </Layout>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
