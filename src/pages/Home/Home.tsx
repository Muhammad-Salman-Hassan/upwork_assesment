import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { usePageEditor } from "../../hooks/usePageEditor";
import { pageService } from "../../services/pageService";
import { addOfferCard, addSlide, BLANK_OFFER_CARD } from "../../store/slices/pageSlice";
import { ToastContainer, useToast } from "../../components/Toast";
import Layout from "../../components/Layout";
import RightBar from "../../components/RightBar";
import ContentPanel from "./ContentPanel";
import type { Language } from "../../types";

export default function Home() {
  const { navId } = useParams<{ navId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toasts, showToast, dismiss } = useToast();
  const [saving, setSaving] = useState(false);

  const {
    pageData, language, loading, setLanguage, updateTextField, updateImageSrc,
    activePageId, setActivePageId,
    activeSubPageId, setActiveSubPageId,
    activePage, activeSubPage,
    sections, currentTitle, sidebarPages,
    activeSectionIndex, setActiveSectionIndex,
  } = usePageEditor(navId);

  async function handleSave() {
    if (!pageData.slug) return;
    setSaving(true);
    try {
      await pageService.publishVersions(pageData.slug, pageData);
      showToast("success", "Page published successfully.");
    } catch {
      showToast("error", "Failed to publish. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleAdd() {
    if (activeSectionIndex === null) return;
    const section = sections[activeSectionIndex];
    if (!section) return;

    if (section.type === "slider") {
      dispatch(addSlide({
        sliderSectionIndex: activeSectionIndex,
        pageId: activePageId ?? undefined,
        subPageId: activeSubPageId ?? undefined,
      }));
    } else if (section.key === "Offers") {
      dispatch(addOfferCard({
        offerSectionIndex: activeSectionIndex,
        card: BLANK_OFFER_CARD,
        pageId: activePageId ?? undefined,
        subPageId: activeSubPageId ?? undefined,
      }));
    }
  }

  const activeSection = activeSectionIndex === null ? null : sections[activeSectionIndex];
  const canAdd = activeSection?.type === "slider" || activeSection?.key === "Offers";

  const rightBar = (
    <RightBar
      title={pageData.title_en ?? pageData.title ?? ""}
      pages={sidebarPages}
      activePageId={activePageId}
      saving={saving}
      sections={sidebarPages.length === 0 ? sections : []}
      activeSectionIndex={activeSectionIndex}
      onPageSelect={(page) => {
        setActivePageId(page.id ?? null);
        setActiveSubPageId(null);
      }}
      onSectionSelect={setActiveSectionIndex}
      onSave={handleSave}
    />
  );

  return (
    <>
      <Layout rightBar={rightBar}>
      
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-500">
            <span>{currentTitle}</span>
            {sidebarPages.length === 0 && activeSectionIndex !== null && sections[activeSectionIndex] && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700">
                  {sections[activeSectionIndex].key?.trim() || `Section ${activeSectionIndex + 1}`}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canAdd && (
              <button
                onClick={handleAdd}
                className="text-xs px-3 py-1.5 rounded border border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors"
              >
                + Add
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          </div>
        </div>

     
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          {(["en", "ar"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                language === lang
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {lang === "en" ? "English" : "Arabic"}
            </button>
          ))}
        </div>

       
        {activePage?.pages && activePage.pages.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-5 p-1 bg-gray-100 rounded-lg">
            {activePage.pages.map((subPage) => (
              <button
                key={subPage.id}
                onClick={() => setActiveSubPageId(subPage.id ?? null)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeSubPageId === subPage.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {subPage.title_en ?? subPage.title}
              </button>
            ))}
          </div>
        )}

       
        <ContentPanel
          loading={loading}
          activePage={activePage}
          activeSubPage={activeSubPage}
          sections={sections}
          activeSectionIndex={activeSectionIndex}
          language={language}
          onTextChange={updateTextField}
          onImageChange={updateImageSrc}
        />
      </Layout>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
