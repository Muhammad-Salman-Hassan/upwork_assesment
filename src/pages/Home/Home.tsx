import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../../components/Toast";
import { usePageData } from "../../hooks/usePageData";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { fetchNavigations } from "../../store/slices/navSlice";
import { pageService } from "../../services/pageService";
import Layout from "../../components/Layout";
import RightBar from "../../components/RightBar";
import Why from "./Why";
import DisclosureTab from "../../components/DisclosureTab";
import BranchesTab from "../../components/BranchesTab";
import FAQTab from "../../components/FAQTab";
import FinancialReportsTab from "../../components/FinancialReportsTab";
import NewsTab from "../../components/NewsTab";
import Loader from "../../components/Loader";
import { updatePageSections, updateSubPageSections, reorderSlides, updateSlideImage, updateLinkField, updateCtaField, addOfferCard, BLANK_OFFER_CARD } from "../../store/slices/pageSlice";
import type { Language, PageNode } from "../../types";
import type { NavItem } from "../../types/nav";

interface ContentPanelProps {
  readonly loading: boolean;
  readonly activePage: import("../../types").PageData | null;
  readonly activeSubPage: import("../../types").PageData | null;
  readonly sections: PageNode[];
  readonly activeSectionIndex: number | null;
  readonly language: Language;
  readonly dispatch: ReturnType<typeof import("../../hooks/useAppDispatch").useAppDispatch>;
  readonly updateTextField: (si: number, path: number[], val: string, pageId?: number, subPageId?: number) => void;
  readonly updateImageSrc: (si: number, path: number[], src: string, pageId?: number, subPageId?: number) => void;
}

function ContentPanel({
  loading, activePage, activeSubPage, sections, activeSectionIndex, language,
  dispatch, updateTextField, updateImageSrc,
}: ContentPanelProps) {
  function onSubPageSections(updatedSections: PageNode[]) {
    if (activePage?.id && activeSubPage?.id) {
      dispatch(updateSubPageSections({ pageId: activePage.id, subPageId: activeSubPage.id, sections: updatedSections }));
    }
  }

  function onActivPageSections(updatedSections: PageNode[]) {
    if (activePage?.id) {
      dispatch(updatePageSections({ pageId: activePage.id, sections: updatedSections }));
    }
  }

  if (loading) return <Loader />;

  if (activePage?.slug === "branches") {
    return (
      <BranchesTab pageData={activePage} language={language} onSectionsChange={onActivPageSections} />
    );
  }
  if (activePage?.slug === "faq") {
    return (
      <FAQTab pageData={activePage} language={language} onSectionsChange={onActivPageSections} />
    );
  }
  if (activePage?.slug === "financial-reports") {
    return <FinancialReportsTab pageData={activePage} language={language} onSectionsChange={onActivPageSections} />;
  }
  if (activePage?.slug === "news") {
    return <NewsTab pageData={activePage} language={language} onSectionsChange={onActivPageSections} />;
  }
  if (activeSubPage?.slug === "disclosure") {
    return <DisclosureTab pageData={activeSubPage} language={language} onSectionsChange={onSubPageSections} />;
  }
  if (sections.length > 0) {
    // No pages — show one section at a time, selected from the sidebar
    if (!activePage && activeSectionIndex === null) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 mt-16 text-center">
          <span className="text-3xl">&#x2190;</span>
          <p className="text-sm text-gray-500 font-medium">Select a section to start editing</p>
          <p className="text-xs text-gray-400">Choose from the sections panel on the right</p>
        </div>
      );
    }
    if (!activePage && activeSectionIndex !== null) {
      const section = sections[activeSectionIndex];
      if (!section) return null;
      return (
        <Why
          sectionIndex={activeSectionIndex}
          section={section}
          language={language}
          slug={undefined}
          onTextChange={(si, path, val) => updateTextField(si, path, val, undefined, undefined)}
          onImageChange={(si, path, src) => updateImageSrc(si, path, src, undefined, undefined)}
          onSlideImageChange={(si, slideIndex, src) =>
            dispatch(updateSlideImage({ sectionIndex: si, slideIndex, src }))}
          onReorderSlides={(si, from, to) =>
            dispatch(reorderSlides({ sectionIndex: si, fromIndex: from, toIndex: to }))}
          onLinkChange={(si, path, field, val) =>
            dispatch(updateLinkField({ sectionIndex: si, path, field, value: val }))}
          onCtaChange={(si, path, field, val) =>
            dispatch(updateCtaField({ sectionIndex: si, path, field, value: val }))}
        />
      );
    }
    // Has pages — render all sections (existing behaviour)
    return (
      <>
        {sections.map((section, index) => (
          <Why
            key={section.id ?? `s-${index}`}
            sectionIndex={index}
            section={section}
            language={language}
            slug={activeSubPage?.slug ?? activePage?.slug}
            onTextChange={(si, path, val) => updateTextField(si, path, val, activePage?.id, activeSubPage?.id)}
            onImageChange={(si, path, src) => updateImageSrc(si, path, src, activePage?.id, activeSubPage?.id)}
            onSlideImageChange={(si, slideIndex, src) =>
              dispatch(updateSlideImage({ sectionIndex: si, slideIndex, src, pageId: activePage?.id, subPageId: activeSubPage?.id }))}
            onReorderSlides={(si, from, to) =>
              dispatch(reorderSlides({ sectionIndex: si, fromIndex: from, toIndex: to, pageId: activePage?.id, subPageId: activeSubPage?.id }))}
            onLinkChange={(si, path, field, val) =>
              dispatch(updateLinkField({ sectionIndex: si, path, field, value: val, pageId: activePage?.id, subPageId: activeSubPage?.id }))}
            onCtaChange={(si, path, field, val) =>
              dispatch(updateCtaField({ sectionIndex: si, path, field, value: val, pageId: activePage?.id, subPageId: activeSubPage?.id }))}
          />
        ))}
      </>
    );
  }
  return <div className="text-sm text-gray-400 mt-8 text-center">Select a sub-page from the right sidebar to edit its content.</div>;
}

function findNavItem(items: NavItem[], id: number): NavItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children.length > 0) {
      const found = findNavItem(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function getPagePath(navItem: NavItem): string {
  const href = navItem.href.split("#")[0];
  if (navItem.children.length === 0) return href;
  const parts = href.split("/").filter(Boolean);
  console.log(parts,"parts")
  return parts.length > 1 ? `/${parts.slice(0, -1).join("/")}` : `/${parts[0]}`;
}

export default function Home() {
  const { navId } = useParams<{ navId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const navItems = useAppSelector((state) => state.nav.items);
  const { pageData, language, loading, fetchPage, setLanguage, updateTextField, updateImageSrc } = usePageData();

 
  const [activePageId, setActivePageId] = useState<number | null>(null);

  const [activeSubPageId, setActiveSubPageId] = useState<number | null>(null);

  useEffect(() => {
    if (navItems.length === 0) dispatch(fetchNavigations());
  }, [dispatch, navItems.length]);

  useEffect(() => {
    if (!navId || navItems.length === 0) return;
    const navItem = findNavItem(navItems, Number(navId));
    if (navItem) fetchPage(getPagePath(navItem));
  }, [navId, navItems, fetchPage]);

  
  useEffect(() => {
    if (pageData.pages && pageData.pages.length > 0) {
      setActivePageId(pageData.pages[0].id ?? null);
      setActiveSubPageId(null);
    } else {
      setActivePageId(null);
      setActiveSubPageId(null);
    }
  }, [pageData.id]);

  
  const activePage = pageData.pages?.find((p) => p.id === activePageId) ?? null;


  useEffect(() => {
    if (activePage?.pages && activePage.pages.length > 0) {
      setActiveSubPageId(activePage.pages[0].id ?? null);
    } else {
      setActiveSubPageId(null);
    }
  }, [activePageId]);

  const activeSubPage = activePage?.pages?.find((p) => p.id === activeSubPageId) ?? null;


  const sections: PageNode[] =
    activeSubPage?.sections ?? activePage?.sections ?? pageData.sections ?? [];

  const currentTitle =
    activeSubPage?.title_en ??
    activePage?.title_en ??
    pageData.title_en ??
    pageData.title ??
    "";

 
  const sidebarPages = pageData.pages ?? [];
  const [saving, setSaving] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const { toasts, showToast, dismiss } = useToast();

  // Reset active section when the page data changes
  useEffect(() => { setActiveSectionIndex(0); }, [pageData.id]);

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

  function handleAddOfferCard() {
    const offerSectionIndex = sections.findIndex((s) => s.key === "Offers");
    if (offerSectionIndex === -1) return;
    dispatch(addOfferCard({
      offerSectionIndex,
      card: BLANK_OFFER_CARD,
      pageId: activePageId ?? undefined,
      subPageId: activeSubPageId ?? undefined,
    }));
    setActiveSectionIndex(offerSectionIndex);
  }

  const offerSectionExists = sections.some((s) => s.key === "Offers");

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
              <span className="text-gray-700">{sections[activeSectionIndex].key?.trim() || `Section ${activeSectionIndex + 1}`}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {offerSectionExists && (
            <button
              onClick={handleAddOfferCard}
              className="text-xs px-3 py-1.5 rounded border border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors"
            >
              + Add Offer
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
        dispatch={dispatch}
        updateTextField={updateTextField}
        updateImageSrc={updateImageSrc}
      />
    </Layout>
    <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
