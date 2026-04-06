import { useState } from "react";
import Layout from "../../components/Layout";
import MinimumSalaryCard from "./MinimumSalaryCard";
import WebsiteThemeCard from "./WebsiteThemeCard";
import Toggle from "../../components/ui/Toggle";
import SelectField from "../../components/ui/SelectField";
import DayPicker from "../../components/ui/DayPicker";

const REMINDER_FOR_OPTIONS = [
  { label: "3 days", value: "3" },
  { label: "5 days", value: "5" },
  { label: "7 days", value: "7" },
  { label: "14 days", value: "14" },
];

const REMINDER_AT_OPTIONS = [
  { label: "9:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "3:00 PM", value: "15:00" },
  { label: "6:00 PM", value: "18:00" },
];

export default function Settings() {
  const [enableReminder, setEnableReminder] = useState(true);
  const [reminderFor, setReminderFor] = useState("3");
  const [reminderAt, setReminderAt] = useState("12:00");
  const [selectedDays, setSelectedDays] = useState(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);

  const handleSave = () => {
    // save settings
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">System Settings</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <WebsiteThemeCard />
          </div>

          <div className="w-120 shrink-0 bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-5">
            <h2 className="text-base font-semibold text-gray-800">Minimum Salary Rules</h2>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Enable Reminder</span>
              <Toggle checked={enableReminder} onChange={setEnableReminder} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-600">Send Reminder for</span>
              <SelectField value={reminderFor} onChange={setReminderFor} options={REMINDER_FOR_OPTIONS} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-600">Send Reminders At</span>
              <SelectField value={reminderAt} onChange={setReminderAt} options={REMINDER_AT_OPTIONS} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-600">Send Reminders on</span>
              <DayPicker selected={selectedDays} onChange={setSelectedDays} />
            </div>
          </div>
        </div>
        <div className="w-[73%]">
        <MinimumSalaryCard />

        </div>

        <div className="flex">
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-8 py-2.5 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Layout>
  );
}
