import axiosInstance from "./axiosInstance";
import type { PageData } from "../types";

export const pageService = {
  getPage: (path: string) =>
    axiosInstance.get<{ data: PageData[] }>(`/cmsbuilder/pages`, { params: { path } }),

  updatePage: (id: number, data: PageData) =>
    axiosInstance.put<PageData>(`/cmsbuilder/pages/${id}`, data),
};
