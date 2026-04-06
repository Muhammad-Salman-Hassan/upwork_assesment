import axiosInstance from "./axiosInstance";
import type { NavItem } from "../types/nav";

export const navService = {
  getNavigations: () => axiosInstance.get<NavItem[]>("/cmsbuilder/navigations"),
};
