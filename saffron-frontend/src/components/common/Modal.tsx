import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  /** يمنع الإغلاق عند النقر على الخلفية (مفيد للنماذج) */
  disableBackdropClose?: boolean;
}

const maxWidthClass: Record<NonNullable<ModalProps["maxWidth"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "md",
  disableBackdropClose = false,
}: ModalProps) {
  // إغلاق بـ ESC + منع تمرير الصفحة
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* الخلفية */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={disableBackdropClose ? undefined : onClose}
      />

      {/* المحتوى */}
      <div
        className={`relative bg-white w-full ${maxWidthClass[maxWidth]} md:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-[slideUp_250ms_ease-out]`}
      >
        {/* الرأس */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>
        )}

        {/* المحتوى القابل للتمرير */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}