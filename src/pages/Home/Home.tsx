import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import Loader from "../../components/Loader";
import { updatePageSections, updateSubPageSections } from "../../store/slices/pageSlice";
import type { Language, PageNode } from "../../types";
import type { NavItem } from "../../types/nav";

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

  async function handleSave() {
    if (pageData.id) {
      await pageService.updatePage(pageData.id, pageData);
    }
  }

  const rightBar = (
    <RightBar
      title={pageData.title_en ?? pageData.title ?? ""}
      pages={sidebarPages}
      activePageId={activePageId}
      onPageSelect={(page) => {
        setActivePageId(page.id ?? null);
        setActiveSubPageId(null);
      }}
      onSave={handleSave}
    />
  );

  return (
    <Layout rightBar={rightBar}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-blue-500 font-medium">{currentTitle}</span>
        <button
          onClick={() => navigate(-1)}
          className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
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

     
      {loading ? (
        <Loader />
      ) : activePage?.slug === "branches" ? (
        <BranchesTab
          pageData={activePage}
          language={language}
          onSectionsChange={(s: PageNode[]) =>
            activePage.id && dispatch(updatePageSections({ pageId: activePage.id, sections: s }))
          }
        />
      ) : activePage?.slug === "faq" ? (
        <FAQTab
          pageData={activePage}
          language={language}
          onSectionsChange={(s: PageNode[]) =>
            activePage.id && dispatch(updatePageSections({ pageId: activePage.id, sections: s }))
          }
        />
      ) : activeSubPage?.slug === "disclosure" ? (
        <DisclosureTab
          pageData={activeSubPage}
          language={language}
          onSectionsChange={(sections) => {
            if (activePage?.id && activeSubPage?.id) {
              dispatch(updateSubPageSections({ pageId: activePage.id, subPageId: activeSubPage.id, sections }));
            }
          }}
        />
      ) : sections.length > 0 ? (
        sections.map((section, index) => (
          <Why
            key={section.id ?? `s-${index}`}
            sectionIndex={index}
            section={section}
            language={language}
            onTextChange={(si, path, val) =>
              updateTextField(si, path, val, activePage?.id, activeSubPage?.id)
            }
            onImageChange={(si, path, src) =>
              updateImageSrc(si, path, src, activePage?.id, activeSubPage?.id)
            }
          />
        ))
      ) : (
        <div className="text-sm text-gray-400 mt-8 text-center">
          Select a sub-page from the right sidebar to edit its content.
        </div>
      )}
    </Layout>
  );
}
