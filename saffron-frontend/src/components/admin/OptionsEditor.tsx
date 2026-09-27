import type { ProductFormOption } from "../../services/adminProductApi";

interface OptionsEditorProps {
  options: ProductFormOption[];
  onChange: (options: ProductFormOption[]) => void;
}

export default function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const addOption = () => {
    onChange([
      ...options,
      {
        name: "",
        type: "single",
        is_required: false,
        sort_order: options.length + 1,
        values: [
          { name: "", extra_price: 0, sort_order: 1 },
        ],
      },
    ]);
  };

  const updateOption = (index: number, patch: Partial<ProductFormOption>) => {
    onChange(
      options.map((o, i) => (i === index ? { ...o, ...patch } : o))
    );
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const addValue = (optionIndex: number) => {
    onChange(
      options.map((o, i) =>
        i === optionIndex
          ? {
              ...o,
              values: [
                ...o.values,
                { name: "", extra_price: 0, sort_order: o.values.length + 1 },
              ],
            }
          : o
      )
    );
  };

  const updateValue = (
    optionIndex: number,
    valueIndex: number,
    patch: { name?: string; extra_price?: number }
  ) => {
    onChange(
      options.map((o, i) =>
        i === optionIndex
          ? {
              ...o,
              values: o.values.map((v, vi) =>
                vi === valueIndex ? { ...v, ...patch } : v
              ),
            }
          : o
      )
    );
  };

  const removeValue = (optionIndex: number, valueIndex: number) => {
    onChange(
      options.map((o, i) =>
        i === optionIndex
          ? { ...o, values: o.values.filter((_, vi) => vi !== valueIndex) }
          : o
      )
    );
  };

  return (
    <div className="space-y-4">
      {options.map((opt, oi) => (
        <div
          key={oi}
          className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
        >
          {/* رأس الخيار */}
          <div className="flex items-start gap-2 mb-3">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                type="text"
                value={opt.name}
                onChange={(e) => updateOption(oi, { name: e.target.value })}
                placeholder="اسم الخيار (مثل: الحجم)"
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-accent"
              />
              <select
                value={opt.type}
                onChange={(e) =>
                  updateOption(oi, {
                    type: e.target.value as "single" | "multiple",
                  })
                }
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-accent"
              >
                <option value="single">اختيار واحد</option>
                <option value="multiple">اختيار متعدد</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => removeOption(oi)}
              className="text-red-500 hover:text-red-700 p-2"
              title="حذف الخيار"
            >
              🗑
            </button>
          </div>

          {/* مطلوب */}
          <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={opt.is_required}
              onChange={(e) => updateOption(oi, { is_required: e.target.checked })}
              className="w-4 h-4 accent-accent"
            />
            <span>مطلوب</span>
          </label>

          {/* القيم */}
          <div className="space-y-2 mb-3">
            {opt.values.map((val, vi) => (
              <div key={vi} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={val.name}
                  onChange={(e) =>
                    updateValue(oi, vi, { name: e.target.value })
                  }
                  placeholder="اسم القيمة (مثل: صغير)"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-accent bg-white"
                />
                <div className="relative w-32">
                  <input
                    type="number"
                    value={val.extra_price}
                    onChange={(e) =>
                      updateValue(oi, vi, {
                        extra_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    step="any"
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-accent bg-white pl-12"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    + سعر
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeValue(oi, vi)}
                  disabled={opt.values.length <= 1}
                  className="text-red-500 hover:text-red-700 p-1.5 disabled:opacity-30"
                  title="حذف القيمة"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addValue(oi)}
            className="text-xs text-accent hover:underline font-semibold"
          >
            + إضافة قيمة
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addOption}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-accent hover:text-accent transition font-semibold text-sm"
      >
        + إضافة مجموعة خيارات
      </button>
    </div>
  );
}