import axiosInstance from "./axiosInstance";
import type { PageData } from "../types";

export const pageService = {
  getPage: (path: string, signal?: AbortSignal) =>
    axiosInstance.get<{ data: PageData[] }>(`/cmsbuilder/pages`, { params: { path }, signal }),

  updatePage: (id: number, data: PageData) =>
    axiosInstance.put<PageData>(`/cmsbuilder/pages/${id}`, data),

  publishVersions: (slug: string, data: PageData) =>
    axiosInstance.put(`/cmsbuilder/pages/${slug}/versions`, data),

  createPage: (data: Record<string, unknown>) =>
    axiosInstance.post(`/cmsbuilder/pages`, data),
};
