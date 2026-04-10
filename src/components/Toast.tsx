import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastItemProps {
  readonly toast: ToastMessage;
  readonly onDismiss: (id: number) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const show = requestAnimationFrame(() => setVisible(true));
    // Auto dismiss after 3.5s
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 3500);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === "success";

  return (
    <div
      className={[
        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm w-full transition-all duration-300",
        isSuccess
          ? "bg-white border-green-100"
          : "bg-white border-red-100",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      ].join(" ")}
    >
      {isSuccess ? (
        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
      ) : (
        <XCircle size={18} className="text-red-500 shrink-0" />
      )}
      <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  readonly toasts: ToastMessage[];
  readonly onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function showToast(type: ToastType, message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
  }

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, showToast, dismiss };
}
