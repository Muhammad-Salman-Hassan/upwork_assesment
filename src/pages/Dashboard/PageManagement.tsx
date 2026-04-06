import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { fetchNavigations } from "../../store/slices/navSlice";
import Layout from "../../components/Layout";

export default function PageManagement() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((state) => state.nav);

  useEffect(() => {
    if (items.length === 0) dispatch(fetchNavigations());
  }, [dispatch, items.length]);

  return (
    <Layout>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Pages Management</h2>
      {loading ? (
        <p className="text-sm text-gray-400">Loading pages...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">{page.title_en}</span>
                <span className="text-xs text-gray-400">{page.href}</span>
              </div>
              <button
                onClick={() => navigate(`/pages/${page.id}`)}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
