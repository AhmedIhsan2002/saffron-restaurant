import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminSettingApi,
  type AdminSetting,
} from "../../services/adminSettingApi";
import { settingsApi } from "../../services/settingsApi";
import { useSettingsStore } from "../../features/settings/settingsStore";
import { useToastStore } from "../../features/toast/toastStore";
import ErrorState from "../../components/common/ErrorState";

const groupLabels: Record<string, string> = {
  general: "عام",
  currency: "العملة",
  contact: "التواصل",
};

const groupIcons: Record<string, string> = {
  general: "🏪",
  currency: "💰",
  contact: "📞",
};

const keyLabels: Record<string, string> = {
  restaurant_name: "اسم المطعم",
  restaurant_tagline: "الشعار النصي",
  restaurant_address: "العنوان",
  restaurant_phone: "رقم الهاتف",
  currency: "رمز العملة (ISO)",
  currency_symbol: "رمز العملة المعروض",
  tax_rate: "نسبة الضريبة (%)",
  orders_open: "استقبال الطلبات مفتوح",
  working_hours: "أوقات العمل",
  whatsapp_number: "رقم واتساب",
  whatsapp_enabled: "تفعيل واتساب",
};

export default function SettingsPage() {
 const setStoreSettings = useSettingsStore((s) => s.setSettings);
  const showToast = useToastStore((s) => s.show);

  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [original, setOriginal] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminSettingApi.getAll();
      setSettings(data);
      setOriginal(data);
    } catch (err) {
      console.error(err);
      setError("تعذّر تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // تجميع حسب group
  const grouped = useMemo(() => {
    const acc: Record<string, AdminSetting[]> = {};
    settings.forEach((s) => {
      if (!acc[s.group]) acc[s.group] = [];
      acc[s.group].push(s);
    });
    return acc;
  }, [settings]);

  // هل هناك تغييرات؟
  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(original);
  }, [settings, original]);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSave = async () => {
    if (saving || !hasChanges) return;

    setSaving(true);

    try {
      await adminSettingApi.update(settings);

      // حدّث settingsStore بالإعدادات العامة
    const publicSettings = await settingsApi.getPublic();
    setStoreSettings(publicSettings);

      setOriginal(settings);
      showToast("تم حفظ الإعدادات بنجاح", "success");
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { message?: string } };
      };
      showToast(
        apiErr.response?.data?.message || "تعذّر حفظ الإعدادات",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!hasChanges) return;
    if (!confirm("هل تريد التراجع عن كل التغييرات؟")) return;
    setSettings(original);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div className="max-w-3xl">
      {/* الرأس */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">الإعدادات</h1>
        <p className="text-sm text-gray-500 mt-1">
          تعديل إعدادات المطعم العامة
        </p>
      </div>

      {/* المجموعات */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([group, items]) => (
          <div
            key={group}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            {/* رأس المجموعة */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="text-xl">{groupIcons[group] || "⚙️"}</span>
              <h2 className="font-bold text-primary">
                {groupLabels[group] || group}
              </h2>
            </div>

            {/* الحقول */}
            <div className="p-5 space-y-4">
              {items.map((s) => (
                <SettingField
                  key={s.key}
                  setting={s}
                  onChange={(v) => updateSetting(s.key, v)}
                  disabled={saving}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* شريط الحفظ (ثابت أسفل) */}
      {hasChanges && (
        <div className="sticky bottom-4 mt-6 bg-white rounded-2xl shadow-xl border border-accent/20 p-4 flex items-center justify-between gap-3 animate-[slideUp_250ms_ease-out]">
          <span className="text-sm font-semibold text-accent flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            لديك تغييرات غير محفوظة
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
            >
              تراجع
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent text-white px-6 py-2 rounded-full font-bold hover:opacity-90 transition shadow-md disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// مكوّن حقول الإعداد
function SettingField({
  setting,
  onChange,
  disabled,
}: {
  setting: AdminSetting;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const label = keyLabels[setting.key] || setting.key;
  const value = setting.value ?? "";

  // Boolean: toggle
  if (setting.type === "boolean") {
    const isOn = value === "1";
    return (
      <div className="flex items-center justify-between py-1">
        <label className="text-sm font-semibold text-ink cursor-pointer">
          {label}
        </label>
        <button
          type="button"
          onClick={() => onChange(isOn ? "0" : "1")}
          disabled={disabled}
          className={`relative w-14 h-7 rounded-full transition ${
            isOn ? "bg-green-500" : "bg-gray-300"
          } disabled:opacity-60`}
          aria-pressed={isOn}
          aria-label={label}
        >
          <span
            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
              isOn ? "right-0.5" : "right-7"
            }`}
          />
        </button>
      </div>
    );
  }

  // JSON: textarea
  if (setting.type === "json") {
    return (
      <div>
        <label className="block text-sm font-semibold text-ink mb-2">
          {label}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          dir="ltr"
          className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent transition text-sm font-mono resize-none"
          placeholder='{"open": "09:00", "close": "23:00"}'
        />
        <p className="mt-1 text-xs text-gray-400">
          يجب أن يكون بصيغة JSON صحيحة
        </p>
      </div>
    );
  }

  // Integer: number
  if (setting.type === "integer") {
    return (
      <div>
        <label className="block text-sm font-semibold text-ink mb-2">
          {label}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          dir="ltr"
          className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent transition text-sm"
        />
      </div>
    );
  }

  // String: text
  return (
    <div>
      <label className="block text-sm font-semibold text-ink mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent transition text-sm"
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}