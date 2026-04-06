import { NavLink, useNavigate, useParams, useMatch } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  HelpCircle,
  Tag,
  AlignLeft,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { logout } from "../store/slices/authSlice";
import { ROUTES } from "../routes/routes";
import logo from "../assets/logo.png";
import type { NavItem } from "../types/nav";

const staticNavItems = [
  { label: "Main dashboard", icon: <LayoutDashboard size={16} />, to: ROUTES.DASHBOARD },
  { label: "Pages Management", icon: <FileText size={16} />, to: ROUTES.PAGES_MANAGEMENT },
  { label: "Announcement", icon: <Megaphone size={16} />, to: ROUTES.ANNOUNCEMENT },
  { label: "Why Us", icon: <HelpCircle size={16} />, to: ROUTES.WHY_US },
  { label: "Offers", icon: <Tag size={16} />, to: ROUTES.OFFERS },
  { label: "Footer", icon: <AlignLeft size={16} />, to: ROUTES.FOOTER },
  { label: "Settings", icon: <Settings size={16} />, to: ROUTES.SETTINGS },
];

function findTopLevelNavItem(items: NavItem[], id: number): NavItem | undefined {
  return items.find(
    (item) =>
      item.id === id ||
      item.children.some((child) => child.id === id)
  );
}

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const navItems = useAppSelector((state) => state.nav.items);

  const pageEditorMatch = useMatch(ROUTES.PAGE_EDITOR);
  const activeNavId = pageEditorMatch?.params?.navId
    ? Number(pageEditorMatch.params.navId)
    : null;

  const activeTopLevel = activeNavId
    ? findTopLevelNavItem(navItems, activeNavId)
    : null;

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col py-6 px-4 shrink-0">
      <div className="flex flex-col items-center mb-6">
        <div className="w-full rounded-lg flex items-center justify-center py-3 mb-3">
          <img src={logo} alt="logo" />
        </div>
        <span className="text-sm font-semibold text-blue-500">{user?.fullname ?? "Admin"}</span>
        <div className="w-full border-b border-gray-200 mt-2" />
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {staticNavItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors w-full ${
                isActive
                  ? "text-blue-500 font-medium"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        {activeTopLevel && activeTopLevel.children.length > 0 && (
          <div className="mt-2 ml-2 border-l border-gray-200 pl-3 flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium px-1 mb-1 uppercase tracking-wide">
              {activeTopLevel.title_en}
            </span>
            {activeTopLevel.children.map((child: NavItem) => (
              <button
                key={child.id}
                onClick={() => navigate(`/pages/${child.id}`)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors w-full text-left ${
                  activeNavId === child.id
                    ? "text-blue-500 font-medium bg-blue-50"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <ChevronRight size={13} />
                {child.title_en}
              </button>
            ))}
          </div>
        )}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mt-auto"
      >
        <LogOut size={16} />
        Log Out
      </button>
    </aside>
  );
}
