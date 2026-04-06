import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./useAppDispatch";
import { setData, setLanguage, updateTextField, updateImageSrc } from "../store/slices/pageSlice";
import { pageService } from "../services/pageService";
import type { Language, PageData } from "../types";

export function usePageData() {
  const dispatch = useAppDispatch();
  const pageData = useAppSelector((state) => state.page.data);
  const language = useAppSelector((state) => state.page.language);
console.log(pageData,"pageData")
  const fetchPage = useCallback(async (path: string) => {
    const res = await pageService.getPage(path);
    const raw = res.data as unknown;
    const page = Array.isArray(raw)
      ? (raw as PageData[])[0]
      : (raw as { data: PageData[] }).data?.[0];
    if (page) dispatch(setData(page));
  }, [dispatch]);

  const handleSetLanguage = useCallback(
    (lang: Language) => dispatch(setLanguage(lang)),
    [dispatch]
  );

  const handleUpdateTextField = useCallback(
    (sectionIndex: number, path: number[], value: string, pageId?: number, subPageId?: number) =>
      dispatch(updateTextField({ sectionIndex, path, value, pageId, subPageId })),
    [dispatch]
  );

  const handleUpdateImageSrc = useCallback(
    (sectionIndex: number, path: number[], src: string, pageId?: number, subPageId?: number) =>
      dispatch(updateImageSrc({ sectionIndex, path, src, pageId, subPageId })),
    [dispatch]
  );

  const saveData = useCallback(async () => {
    console.log(JSON.stringify(pageData),"pageData")
    if (pageData.id) await pageService.updatePage(pageData.id, pageData);
  }, [pageData]);

  return {
    pageData,
    language,
    fetchPage,
    setLanguage: handleSetLanguage,
    updateTextField: handleUpdateTextField,
    updateImageSrc: handleUpdateImageSrc,
    saveData,
  };
}
