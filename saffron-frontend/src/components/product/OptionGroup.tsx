import type { ProductOption } from "../../types/product";
import { useSettingsStore } from "../../features/settings/settingsStore";

interface OptionGroupProps {
  option: ProductOption;
  selectedValueIds: number[];
  onChange: (valueIds: number[]) => void;
  error?: string;
}

export default function OptionGroup({
  option,
  selectedValueIds,
  onChange,
  error,
}: OptionGroupProps) {
  const settings = useSettingsStore((s) => s.settings);
  const currency = settings?.currency_symbol || "ل.س";

  const isMultiple = option.type === "multiple";

  const toggleValue = (valueId: number) => {
    if (isMultiple) {
      const next = selectedValueIds.includes(valueId)
        ? selectedValueIds.filter((id) => id !== valueId)
        : [...selectedValueIds, valueId];
      onChange(next);
    } else {
      onChange([valueId]);
    }
  };

  return (
    <div className="mb-6">
      {/* رأس المجموعة */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-primary text-base">
          {option.name}
          {option.is_required && (
            <span className="text-red-500 mr-1" title="مطلوب">
              *
            </span>
          )}
        </h4>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {isMultiple ? "اختيار متعدد" : "اختيار واحد"}
        </span>
      </div>

      {/* القيم */}
      <div className="space-y-2">
        {option.values.map((value) => {
          const isSelected = selectedValueIds.includes(value.id);
          const extraPrice = parseFloat(value.extra_price);

          return (
            <button
              key={value.id}
              type="button"
              onClick={() => toggleValue(value.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition text-right ${
                isSelected
                  ? "border-accent bg-accent/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* مؤشر الاختيار */}
                <span
                  className={`flex-shrink-0 w-5 h-5 border-2 flex items-center justify-center ${
                    isMultiple ? "rounded" : "rounded-full"
                  } ${
                    isSelected
                      ? "border-accent bg-accent"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>

                <span className="font-medium text-ink">{value.name}</span>
              </div>

              {extraPrice > 0 && (
                <span className="text-sm font-semibold text-accent">
                  + {extraPrice.toLocaleString("ar-SY")} {currency}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}