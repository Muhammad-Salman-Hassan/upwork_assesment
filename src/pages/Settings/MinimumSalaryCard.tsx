import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

const CURRENCIES = ["KWD", "USD", "EUR", "SAR", "AED"];

interface SalaryRow {
  id: string;
  label: string;
  amount: string;
  currency: string;
}

export default function MinimumSalaryCard() {
  const [rows, setRows] = useState<SalaryRow[]>([
    { id: "kuwaiti", label: "Kuwaiti", amount: "400", currency: "KWD" },
    { id: "non-kuwaiti", label: "Non-Kuwaiti", amount: "350", currency: "KWD" },
  ]);

  const updateRow = (id: string, field: keyof SalaryRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, label: "Nationality", amount: "0", currency: "KWD" },
    ]);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Minimum Salary Rules</h2>

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 w-36">{row.label}</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <input
                type="number"
                value={row.amount}
                onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                className="w-20 px-3 py-2 text-sm text-gray-700 focus:outline-none"
              />
              <div className="border-l border-gray-200 px-1 flex items-center gap-1 bg-white">
                <select
                  value={row.currency}
                  onChange={(e) => updateRow(row.id, "currency", e.target.value)}
                  className="text-sm text-gray-600 bg-transparent focus:outline-none appearance-none pr-5 pl-2 py-2"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="text-gray-400 -ml-4 pointer-events-none" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 mt-4 transition-colors"
      >
        <Plus size={15} />
        Add nationality-specific override
      </button>
    </div>
  );
}
