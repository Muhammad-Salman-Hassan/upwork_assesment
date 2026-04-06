export interface NavItem {
  id: number;
  title_en: string;
  title_ar: string;
  is_active: number;
  parent_id: number;
  href: string;
  children: NavItem[];
}
