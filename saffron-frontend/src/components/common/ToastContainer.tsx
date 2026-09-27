import { useToastStore, type ToastType } from "../../features/toast/toastStore";

const styles: Record<ToastType, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-primary text-white",
};

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:right-4 md:w-80 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
           key={toast.id}
          className={`${styles[toast.type]} p-3 rounded-xl shadow-2xl flex items-center gap-3 pointer-events-auto animate-[slideUp_250ms_ease-out]`}
          role="status"
          aria-live="polite"
        >
          <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-white/20 rounded-full text-sm font-bold">
            {icons[toast.type]}
          </span>
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => remove(toast.id)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}