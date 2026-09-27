import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../features/cart/cartStore";
import { useSettingsStore } from "../../features/settings/settingsStore";
import { useLastOrderStore } from "../../features/orders/lastOrderStore";
import { useToastStore } from "../../features/toast/toastStore";
import { orderApi } from "../../services/orderApi";
import type { CreateOrderPayload } from "../../types/order";
import type { ApiError } from "../../types/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const settings = useSettingsStore((s) => s.settings);
  const ordersClosed = settings?.orders_open === false;
  const setLastOrder = useLastOrderStore((s) => s.setLastOrder);
  const showToast = useToastStore((s) => s.show);

  const [tableNumber, setTableNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // إن كانت السلة فارغة → أعد التوجيه للرئيسية
  if (items.length === 0 && !submitting) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-lg mb-4">لا يوجد شيء في سلتك</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white px-6 py-2 rounded-full hover:bg-accent transition"
        >
          العودة للمنيو
        </button>
      </div>
    );
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!tableNumber.trim()) {
      errs.table_number = "رقم الطاولة مطلوب";
    } else if (tableNumber.trim().length > 20) {
      errs.table_number = "رقم الطاولة طويل جدًا";
    }

    if (guestName && guestName.length > 100) {
      errs.guest_name = "الاسم طويل جدًا";
    }

    if (notes && notes.length > 500) {
      errs.notes = "الملاحظات طويلة جدًا (الحد 500 حرف)";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (submitting) return;
    setGeneralError(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const payload: CreateOrderPayload = {
        table_number: tableNumber.trim(),
        guest_name: guestName.trim() || undefined,
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          options: item.selected_options.length
            ? [
                // نُجمّع القيم حسب option_id
                ...Object.values(
                  item.selected_options.reduce((acc, opt) => {
                    if (!acc[opt.option_id]) {
                      acc[opt.option_id] = {
                        option_id: opt.option_id,
                        value_ids: [],
                      };
                    }
                    acc[opt.option_id].value_ids.push(opt.value_id);
                    return acc;
                  }, {} as Record<number, { option_id: number; value_ids: number[] }>)
                ),
              ]
            : undefined,
        })),
      };

      const response = await orderApi.create(payload);

      // نجح
      setLastOrder(response.order_number, response.public_token);
      clearCart();
      showToast("تم استلام طلبك بنجاح", "success");
      navigate(`/order-success/${response.public_token}`, { replace: true });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: ApiError; status?: number } };

      if (apiErr.response?.status === 422 && apiErr.response.data?.errors) {
        // أخطاء تحقق من Laravel
        const fieldErrors: Record<string, string> = {};
        Object.entries(apiErr.response.data.errors).forEach(([key, msgs]) => {
          fieldErrors[key] = msgs[0];
        });
        setErrors(fieldErrors);
        setGeneralError("يرجى مراجعة الحقول المُعلَّمة");
      } else if (apiErr.response?.status === 404) {
        setGeneralError("إحدى الفئات أو المنتجات لم تعد متوفرة");
      } else if (apiErr.response?.data?.message) {
        setGeneralError(apiErr.response.data.message);
      } else {
        setGeneralError("تعذّر إرسال الطلب. تحقق من اتصالك وأعد المحاولة.");
      }

      showToast("فشل إرسال الطلب", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const currency = settings?.currency_symbol || "ل.س";
  const taxRate = settings?.tax_rate ?? 0;
  const subtotal = useCartStore.getState().getSubtotal();
  const total = useCartStore.getState().getTotal(taxRate);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-40">
      <h1 className="text-2xl font-bold text-primary mb-6">إتمام الطلب</h1>
      {ordersClosed && (
  <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 text-red-800 rounded-xl">
    <p className="font-bold mb-1">🔒 استقبال الطلبات مغلق حاليًا</p>
    <p className="text-sm">
      {settings?.working_hours
        ? `نستقبل الطلبات من ${settings.working_hours.open} إلى ${settings.working_hours.close}.`
        : "الرجاء المحاولة خلال أوقات العمل."}
    </p>
  </div>
)}

      {generalError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* رقم الطاولة */}
        <div>
          <label
            htmlFor="table_number"
            className="block text-sm font-bold text-primary mb-2"
          >
            رقم الطاولة <span className="text-red-500">*</span>
          </label>
          <input
            id="table_number"
            type="text"
            inputMode="numeric"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="مثال: 5"
            className={`w-full px-4 py-3 rounded-xl border-2 text-lg text-center font-bold focus:outline-none transition ${
              errors.table_number
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-accent"
            }`}
            autoFocus
          />
          {errors.table_number && (
            <p className="mt-1 text-sm text-red-600">{errors.table_number}</p>
          )}
        </div>

        {/* الاسم (اختياري) */}
        <div>
          <label
            htmlFor="guest_name"
            className="block text-sm font-bold text-primary mb-2"
          >
            الاسم <span className="text-gray-400 font-normal">(اختياري)</span>
          </label>
          <input
            id="guest_name"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="اسمك"
            maxLength={100}
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition ${
              errors.guest_name
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-accent"
            }`}
          />
          {errors.guest_name && (
            <p className="mt-1 text-sm text-red-600">{errors.guest_name}</p>
          )}
        </div>

        {/* الملاحظات (اختياري) */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-bold text-primary mb-2"
          >
            ملاحظات <span className="text-gray-400 font-normal">(اختياري)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: بدون بصل، حار قليلًا..."
            rows={3}
            maxLength={500}
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition resize-none ${
              errors.notes
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-accent"
            }`}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
          )}
          <p className="mt-1 text-xs text-gray-400 text-left">
            {notes.length} / 500
          </p>
        </div>

        {/* ملخص */}
        <div className="bg-white rounded-2xl p-4 space-y-2 border border-gray-100">
          <h3 className="font-bold text-primary mb-3">ملخص الطلب</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              عدد العناصر ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
            <span className="font-semibold">
              {subtotal.toLocaleString("ar-SY")} {currency}
            </span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">الضريبة ({taxRate}%)</span>
              <span className="font-semibold">
                {(total - subtotal).toLocaleString("ar-SY")} {currency}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-gray-100 text-lg font-bold text-primary">
            <span>الإجمالي</span>
            <span>
              {total.toLocaleString("ar-SY")} {currency}
            </span>
          </div>
        </div>

        <button
  type="submit"
  disabled={submitting || ordersClosed}
  className="w-full bg-accent text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
  {submitting ? (
    <>
      <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      جاري الإرسال...
    </>
  ) : ordersClosed ? (
    "الطلبات مغلقة حاليًا"
  ) : (
    "تأكيد الطلب"
  )}
</button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={submitting}
          className="w-full text-gray-500 text-sm py-2 hover:text-primary transition disabled:opacity-50"
        >
          العودة
        </button>
      </form>
    </div>
  );
}
