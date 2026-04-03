import { Search, X } from "lucide-react";
import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
      <Search size={16} className="text-gray-400 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Page"
        className="flex-1 text-sm outline-none text-gray-600 placeholder-gray-400"
      />
      {query && (
        <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
