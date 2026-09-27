import { useState } from "react";
import type { OrderStatus } from "../../types/order";
import { statusLabels, statusColors } from "./OrderStatusBadge";

interface OrderStatusDropdownProps {
  current: OrderStatus;
  onChange: (status: OrderStatus) => Promise<void> | void;
  disabled?: boolean;
}

const allStatuses: OrderStatus[] = [
  "pending",
  "preparing",
  "served",
  "cancelled",
];

export default function OrderStatusDropdown({
  current,
  onChange,
  disabled,
}: OrderStatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleSelect = async (status: OrderStatus) => {
    if (status === current || updating) {
      setOpen(false);
      return;
    }

    setUpdating(true);
    try {
      await onChange(status);
    } finally {
      setUpdating(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-block" dir="rtl">
      <button
        onClick={() => setOpen((s) => !s)}
        disabled={disabled || updating}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${statusColors[current]} hover:opacity-90 disabled:opacity-60`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {updating ? (
          <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <span
            className="w-2 h-2 rounded-full bg-current opacity-60"
            aria-hidden="true"
          />
        )}
        <span>{statusLabels[current]}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3 h-3 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <>
          {/* طبقة إغلاق عند النقر خارجًا */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div
            className="absolute z-20 mt-2 right-0 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
            role="listbox"
          >
            {allStatuses.map((status) => {
              const isCurrent = status === current;
              return (
                <button
                  key={status}
                  onClick={() => handleSelect(status)}
                  disabled={isCurrent}
                  className={`w-full text-right px-4 py-2.5 text-sm transition flex items-center justify-between ${
                    isCurrent
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "hover:bg-gray-50 text-ink"
                  }`}
                  role="option"
                  aria-selected={isCurrent}
                >
                  <span>{statusLabels[status]}</span>
                  {isCurrent && <span className="text-xs">حالي</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}