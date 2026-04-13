import { useAppDispatch } from "../../hooks/useAppDispatch";
import { updatePageSections, updateSubPageSections, reorderSlides, updateSlideImage, updateLinkField, updateCtaField, removeSlide } from "../../store/slices/pageSlice";
import Loader from "../../components/Loader";
import BranchesTab from "../../components/BranchesTab";
import FAQTab from "../../components/FAQTab";
import FinancialReportsTab from "../../components/FinancialReportsTab";
import NewsTab from "../../components/NewsTab";
import DisclosureTab from "../../components/DisclosureTab";
import Why from "./Why";
import type { Language, PageData, PageNode } from "../../types";

interface ContentPanelProps {
  readonly loading: boolean;
  readonly activePage: PageData | null;
  readonly activeSubPage: PageData | null;
  readonly sections: PageNode[];
  readonly activeSectionIndex: number | null;
  readonly language: Language;
  readonly onTextChange: (si: number, path: number[], val: string, pageId?: number, subPageId?: number) => void;
  readonly onImageChange: (si: number, path: number[], src: string, pageId?: number, subPageId?: number) => void;
}

export default function ContentPanel({
  loading, activePage, activeSubPage, sections, activeSectionIndex, language,
  onTextChange, onImageChange,
}: ContentPanelProps) {
  const dispatch = useAppDispatch();

  function onActivePageSections(updatedSections: PageNode[]) {
    if (activePage?.id) {
      dispatch(updatePageSections({ pageId: activePage.id, sections: updatedSections }));
    }
  }

  function onSubPageSections(updatedSections: PageNode[]) {
    if (activePage?.id && activeSubPage?.id) {
      dispatch(updateSubPageSections({ pageId: activePage.id, subPageId: activeSubPage.id, sections: updatedSections }));
    }
  }

  const pageId = activePage?.id;
  const subPageId = activeSubPage?.id;

  function makeWhyProps(pi?: number, spi?: number) {
    return {
      language,
      onTextChange: (si: number, path: number[], val: string) => onTextChange(si, path, val, pi, spi),
      onImageChange: (si: number, path: number[], src: string) => onImageChange(si, path, src, pi, spi),
      onSlideImageChange: (si: number, slideIndex: number, src: string) =>
        dispatch(updateSlideImage({ sectionIndex: si, slideIndex, src, pageId: pi, subPageId: spi })),
      onReorderSlides: (si: number, from: number, to: number) =>
        dispatch(reorderSlides({ sectionIndex: si, fromIndex: from, toIndex: to, pageId: pi, subPageId: spi })),
      onDeleteSlide: (si: number, slideIndex: number) =>
        dispatch(removeSlide({ sectionIndex: si, slideIndex, pageId: pi, subPageId: spi })),
      onLinkChange: (si: number, path: number[], field: "link_en" | "link_ar", val: string) =>
        dispatch(updateLinkField({ sectionIndex: si, path, field, value: val, pageId: pi, subPageId: spi })),
      onCtaChange: (si: number, path: number[], field: "label_en" | "label_ar" | "link_en" | "link_ar", val: string) =>
        dispatch(updateCtaField({ sectionIndex: si, path, field, value: val, pageId: pi, subPageId: spi })),
    };
  }

  if (loading) return <Loader />;

  if (activePage?.slug === "branches")
    return <BranchesTab pageData={activePage} language={language} onSectionsChange={onActivePageSections} />;

  if (activePage?.slug === "faq")
    return <FAQTab pageData={activePage} language={language} onSectionsChange={onActivePageSections} />;

  if (activePage?.slug === "financial-reports")
    return <FinancialReportsTab pageData={activePage} language={language} onSectionsChange={onActivePageSections} />;

  if (activePage?.slug === "news")
    return <NewsTab pageData={activePage} language={language} onSectionsChange={onActivePageSections} />;

  if (activeSubPage?.slug === "disclosure")
    return <DisclosureTab pageData={activeSubPage} language={language} onSectionsChange={onSubPageSections} />;

  if (sections.length === 0)
    return <div className="text-sm text-gray-400 mt-8 text-center">Select a sub-page from the right sidebar to edit its content.</div>;

  // Root page (no sub-pages) — show one section at a time
  if (!activePage) {
    if (activeSectionIndex === null) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 mt-16 text-center">
          <span className="text-3xl">&#x2190;</span>
          <p className="text-sm text-gray-500 font-medium">Select a section to start editing</p>
          <p className="text-xs text-gray-400">Choose from the sections panel on the right</p>
        </div>
      );
    }
    const section = sections[activeSectionIndex];
    if (!section) return null;
    return <Why sectionIndex={activeSectionIndex} section={section} slug={undefined} {...makeWhyProps()} />;
  }

  // Has sub-pages — render all sections
  return (
    <>
      {sections.map((section, index) => (
        <Why
          key={section.id ?? `s-${index}`}
          sectionIndex={index}
          section={section}
          slug={activeSubPage?.slug ?? activePage?.slug}
          {...makeWhyProps(pageId, subPageId)}
        />
      ))}
    </>
  );
}
