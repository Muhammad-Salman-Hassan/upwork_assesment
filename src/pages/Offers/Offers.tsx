import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Layout from "../../components/Layout";
import { pageService } from "../../services/pageService";
import { ROUTES } from "../../routes/routes";
import type { PageData } from "../../types";

export default function Offers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchOffers() {
      setLoading(true);
      try {
        const res = await pageService.getPage("/offers", controller.signal);
        if (!cancelled) {
          const data = res.data.data ?? [];
          setOffers(Array.isArray(data) ? data : [data]);
        }
      } catch {
        if (!cancelled) setOffers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOffers();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Offers</h2>
        <button
          onClick={() => navigate(ROUTES.OFFERS_CREATE)}
          className="flex items-center gap-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Create Offer
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading offers…</p>
      ) : offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 mt-20 text-center">
          <p className="text-sm text-gray-500 font-medium">No offer pages found</p>
          <p className="text-xs text-gray-400">Click "Create Offer" to add one</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title (EN)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title (AR)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((offer, index) => (
                <tr key={offer.id ?? index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{offer.title_en ?? offer.title}</td>
                  <td className="px-4 py-3 text-gray-600 text-right" dir="rtl">{offer.title_ar}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{offer.path}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/pages/${offer.id}`)}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      Edit
                    </button>
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
