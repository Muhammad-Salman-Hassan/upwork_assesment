import axiosInstance from "./axiosInstance";
import type { NavItem } from "../types/nav";

export const navService = {
  getNavigations: () => axiosInstance.get<NavItem[]>("/cmsbuilder/navigations"),
  updateAll: (items: NavItem[]) =>
    axiosInstance.put<NavItem[]>("/cmsbuilder/navigations", items),
  addNavigation: (parentId: number, data: Partial<NavItem>) =>
    axiosInstance.post(`/cmsbuilder/navigations/${parentId}`, data),
};
