import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { fetchNavigations, toggleNavActive, deleteNav, persistNavigations } from "../../store/slices/navSlice";
import Layout from "../../components/Layout";

export default function PageManagement() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, updating } = useAppSelector((state) => state.nav);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (items.length === 0) dispatch(fetchNavigations());
  }, [dispatch, items.length]);

  const handleToggle = (id: number) => {
    dispatch(toggleNavActive(id));
    dispatch(persistNavigations());
  };

  const handleDelete = (id: number) => {
    if (deleteConfirmId === id) {
      dispatch(deleteNav(id));
      dispatch(persistNavigations());
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Pages Management</h2>
        {updating && (
          <span className="text-xs text-gray-400 animate-pulse">Saving...</span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading pages...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title (EN)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title (AR)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((page, index) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{page.title_en}</td>
                  <td className="px-4 py-3 text-gray-600 text-right" dir="rtl">{page.title_ar}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{page.href}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggle(page.id); }}
                      disabled={updating}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        page.is_active === 1
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          page.is_active === 1 ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      {page.is_active === 1 ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/pages/${page.id}`)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        disabled={updating}
                        className={`text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          deleteConfirmId === page.id
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-red-100 hover:bg-red-200 text-red-600"
                        }`}
                      >
                        {deleteConfirmId === page.id ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
