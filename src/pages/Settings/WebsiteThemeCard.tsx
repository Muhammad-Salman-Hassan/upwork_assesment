import { useState } from "react";
import DateInput from "../../components/ui/DateInput";
import OccasionThemeTab from "./tabs/OccasionThemeTab";
import WebsiteThemeTab from "./tabs/WebsiteThemeTab";

type ThemeTab = "website" | "occasion";

export default function WebsiteThemeCard() {
  const [activeTab, setActiveTab] = useState<ThemeTab>("occasion");
  const [selectedColor, setSelectedColor] = useState("default");
  const [selectedOccasion, setSelectedOccasion] = useState("default");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApply = () => {
    // apply theme
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-6 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab("website")}
          className={`text-base font-medium transition-colors ${
            activeTab === "website" ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Website theme
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("occasion")}
          className={`text-base font-medium transition-colors ${
            activeTab === "occasion" ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Occasion Theme
        </button>
      </div>

      {activeTab === "occasion" ? (
        <OccasionThemeTab selected={selectedOccasion} onSelect={setSelectedOccasion} />
      ) : (
        <WebsiteThemeTab selected={selectedColor} onSelect={setSelectedColor} />
      )}

      <div className="grid grid-cols-2 gap-4 mt-5">
        <DateInput label="Start Date" value={startDate} onChange={setStartDate} />
        <DateInput label="End Date" value={endDate} onChange={setEndDate} />
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={handleApply}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-10 py-2.5 rounded-lg transition-colors"
        >
          {activeTab === "occasion" ? "Apply Theme" : "Apply Colors"}
        </button>
      </div>
    </div>
  );
}
