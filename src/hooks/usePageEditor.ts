import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./useAppDispatch";
import { fetchNavigations } from "../store/slices/navSlice";
import { usePageData } from "./usePageData";
import type { NavItem } from "../types/nav";

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

export function usePageEditor(navId: string | undefined) {
  const dispatch = useAppDispatch();
  const navItems = useAppSelector((state) => state.nav.items);
  const { pageData, language, loading, fetchPage, setLanguage, updateTextField, updateImageSrc } = usePageData();

  const [activePageId, setActivePageId] = useState<number | null>(null);
  const [activeSubPageId, setActiveSubPageId] = useState<number | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);

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

  useEffect(() => { setActiveSectionIndex(0); }, [pageData.id]);

  const activeSubPage = activePage?.pages?.find((p) => p.id === activeSubPageId) ?? null;
  const sections = activeSubPage?.sections ?? activePage?.sections ?? pageData.sections ?? [];
  const currentTitle = activeSubPage?.title_en ?? activePage?.title_en ?? pageData.title_en ?? pageData.title ?? "";
  const sidebarPages = pageData.pages ?? [];

  return {
    pageData, language, loading, setLanguage, updateTextField, updateImageSrc,
    activePageId, setActivePageId,
    activeSubPageId, setActiveSubPageId,
    activePage, activeSubPage,
    sections, currentTitle, sidebarPages,
    activeSectionIndex, setActiveSectionIndex,
  };
}
