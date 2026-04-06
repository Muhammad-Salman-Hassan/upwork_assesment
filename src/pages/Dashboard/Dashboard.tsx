import { useNavigate } from "react-router-dom";
import { FileText, Megaphone, Tag, Settings, Lightbulb } from "lucide-react";
import Layout from "../../components/Layout";
import NavCard from "./NavCard";
import QuickActionCard from "./QuickActionCard";
import { ROUTES } from "../../routes/routes";

const navCards = [
  { label: "Pages", icon: <FileText size={22} />, to: ROUTES.PAGES_MANAGEMENT },
  { label: "Announcement", icon: <Megaphone size={22} />, to: ROUTES.ANNOUNCEMENT },
  { label: "Offers", icon: <Tag size={22} />, to: ROUTES.OFFERS },
  { label: "Theme", icon: <Settings size={22} />, to: ROUTES.SETTINGS },
  { label: "Ads", icon: <Lightbulb size={22} />, to: "#" },
];

const quickActions = [
  "New Announcement",
  "New Offers",
  "Update Financials",
  "Latest Disclosure",
  "Banner",
  "Office Timings",
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Manage and organize your website</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {navCards.map((card) => (
          <NavCard
            key={card.label}
            label={card.label}
            icon={card.icon}
            onClick={() => navigate(card.to)}
          />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action} label={action} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
