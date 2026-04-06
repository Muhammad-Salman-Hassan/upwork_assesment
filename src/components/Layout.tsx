import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";

interface LayoutProps {
  readonly children: React.ReactNode;
  readonly rightBar?: React.ReactNode;
}

export default function Layout({ children, rightBar }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <SearchBar />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 flex flex-col">
            {children}
          </main>

          {rightBar && (
            <aside className="shrink-0">
              {rightBar}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
