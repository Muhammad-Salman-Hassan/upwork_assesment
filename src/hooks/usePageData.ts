import { useCallback, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "./useAppDispatch";
import { setData, clearData, setLanguage, updateTextField, updateImageSrc } from "../store/slices/pageSlice";
import { pageService } from "../services/pageService";
import type { Language, PageData } from "../types";

export function usePageData() {
  const dispatch = useAppDispatch();
  const pageData = useAppSelector((state) => state.page.data);
  const language = useAppSelector((state) => state.page.language);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(async (path: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch(clearData());
    setLoading(true);

    try {
      const res = await pageService.getPage(path, controller.signal);
      if (controller.signal.aborted) return;
      const raw = res.data as unknown;
      const page = Array.isArray(raw)
        ? (raw as PageData[])[0]
        : (raw as { data: PageData[] }).data?.[0];
      if (page) dispatch(setData(page));
      else dispatch(clearData());
    } catch {
      if (!controller.signal.aborted) dispatch(clearData());
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
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
    if (pageData.id) await pageService.updatePage(pageData.id, pageData);
  }, [pageData]);

  return {
    pageData,
    language,
    loading,
    fetchPage,
    setLanguage: handleSetLanguage,
    updateTextField: handleUpdateTextField,
    updateImageSrc: handleUpdateImageSrc,
    saveData,
  };
}
