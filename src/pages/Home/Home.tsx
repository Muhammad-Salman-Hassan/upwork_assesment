import { useState } from "react";
import { usePageData } from "../../hooks/usePageData";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar";
import RightBar from "../../components/RightBar";
import Why from "./Why";
import type { Language } from "../../types";

export default function Home() {
  const { pageData, language, setLanguage, updateTextField, updateImageSrc, saveData } =
    usePageData();
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const activeSection = pageData.sections[activeSectionIndex];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <SearchBar />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 flex flex-col">
            <div className="mb-3">
              <span className="text-sm text-blue-500 font-medium">{pageData.title_en}</span>
            </div>

            <div className="flex gap-2 mb-5 border-b border-gray-200">
              {(["en", "ar"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    language === lang
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {lang === "en" ? "English" : "Arabic"}
                </button>
              ))}
            </div>

            {activeSection && (
              <Why
                sectionIndex={activeSectionIndex}
                section={activeSection}
                language={language}
                onTextChange={updateTextField}
                onImageChange={updateImageSrc}
                onSave={saveData}
              />
            )}
          </main>

          <RightBar
            pageData={pageData}
            activeSectionIndex={activeSectionIndex}
            onSectionSelect={setActiveSectionIndex}
          />
        </div>
      </div>
    </div>
  );
}
