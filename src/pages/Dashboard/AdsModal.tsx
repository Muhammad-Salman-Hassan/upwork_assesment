import { useState } from "react";
import { X, Smartphone, Monitor } from "lucide-react";
import { useToast, ToastContainer } from "../../components/Toast";
import ImageField from "../../components/fields/ImageField";
import axiosInstance from "../../services/axiosInstance";

type AdType = "POPUP_MOBILE" | "POPUP_WEB";

interface AdsModalProps {
  readonly onClose: () => void;
}

export default function AdsModal({ onClose }: AdsModalProps) {
  const { toasts, showToast, dismiss } = useToast();
  const [adType, setAdType] = useState<AdType>("POPUP_MOBILE");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [promotionImg, setPromotionImg] = useState("");
  const [promotionLink, setPromotionLink] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setLoading(true);
    try {
      const messageJson = JSON.stringify({
        promotion_img: promotionImg,
        promotion_link: promotionLink,
      });

      await axiosInstance.post(
        "/notifications",
        JSON.stringify({
          method: adType,
          title: { en: titleEn, ar: titleAr },
          message: { en: messageJson, ar: messageJson },
          targets: ["0"],
          event: "POPUP_EVENT",
        }),
        {
          headers: {
            "Content-Type": "text/plain",
            Authorization: `Basic ${localStorage.getItem("token")}`,
          },
        }
      );

      showToast("success", "Ad added successfully.");
      setTimeout(onClose, 1500);
    } catch {
      showToast("error", "Failed to add ad. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

      <button
        type="button"
        aria-label="Close modal"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm w-full cursor-default"
        onClick={onClose}
      />


      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto overflow-y-auto max-h-[90vh]">

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">Add Ad</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
     
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Ad Type</p>
              <div className="grid grid-cols-2 gap-3">
                {(["POPUP_MOBILE", "POPUP_WEB"] as AdType[]).map((type) => {
                  const isMobile = type === "POPUP_MOBILE";
                  const active = adType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAdType(type)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        active
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {isMobile ? <Smartphone size={16} /> : <Monitor size={16} />}
                      {isMobile ? "Mobile" : "Web"}
                    </button>
                  );
                })}
              </div>
            </div>

   
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ads-title-en" className="block text-xs font-medium text-gray-500 mb-1">
                  Title (English)
                </label>
                <input
                  id="ads-title-en"
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  required
                  placeholder="Enter title in English"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label htmlFor="ads-title-ar" className="block text-xs font-medium text-gray-500 mb-1">
                  Title (Arabic)
                </label>
                <input
                  id="ads-title-ar"
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  required
                  dir="rtl"
                  placeholder="أدخل العنوان بالعربية"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
            </div>

         
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Promotion Image</p>
              <ImageField src={promotionImg} onImageChange={setPromotionImg} />
            </div>

       
            <div>
              <label htmlFor="ads-promo-link" className="block text-xs font-medium text-gray-500 mb-1">
                Promotion Link
              </label>
              <input
                id="ads-promo-link"
                type="text"
                value={promotionLink}
                onChange={(e) => setPromotionLink(e.target.value)}
                required
                placeholder="e.g. Register"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>

      
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-lg transition-colors"
              >
                {loading ? "Adding…" : "Add Ad"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
