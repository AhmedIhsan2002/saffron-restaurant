import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/authApi";
import { useAuthStore } from "../../features/auth/authStore";
import { useToastStore } from "../../features/toast/toastStore";
import { useSettingsStore } from "../../features/settings/settingsStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const showToast = useToastStore((s) => s.show);
  const restaurantName = useSettingsStore((s) => s.settings?.restaurant_name);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // إن كان مسجّلًا دخول بالفعل، انتقل مباشرة
  useEffect(() => {
    if (token) {
      navigate("/admin/orders", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setFieldErrors({});

    // تحقق محلي سريع
    if (!email.trim()) {
      setFieldErrors({ email: "البريد الإلكتروني مطلوب" });
      return;
    }
    if (!password) {
      setFieldErrors({ password: "كلمة المرور مطلوبة" });
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.login(email.trim(), password);
      setAuth(res.token, res.admin);
      showToast(`أهلًا بك، ${res.admin.name}`, "success");
      navigate("/admin/orders", { replace: true });
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
      };

      if (apiErr.response?.status === 422 && apiErr.response.data?.errors) {
        const fe: Record<string, string> = {};
        Object.entries(apiErr.response.data.errors).forEach(([key, msgs]) => {
          fe[key] = msgs[0];
        });
        setFieldErrors(fe);
        setError(apiErr.response.data.message || "تحقق من البيانات");
      } else if (apiErr.response?.status === 401) {
        setError("البريد أو كلمة المرور غير صحيحة");
      } else {
        setError("تعذّر الاتصال بالخادم، حاول مجددًا");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md">
        {/* البطاقة */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* الشعار */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {(restaurantName || "ش").charAt(0)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-1">
              {restaurantName || "شفرة"}
            </h1>
            <p className="text-sm text-gray-500">لوحة الإدارة</p>
          </div>

          {/* رسالة الخطأ العامة */}
          {error && (
            <div
              className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2"
              role="alert"
            >
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* البريد */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-primary mb-2"
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                dir="ltr"
                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition ${
                  fieldErrors.email
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-accent"
                }`}
                disabled={loading}
                autoFocus
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* كلمة المرور */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-primary mb-2"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  dir="ltr"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border-2 focus:outline-none transition ${
                    fieldErrors.password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-accent"
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* زر الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-accent transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>

        {/* رابط العودة للمنيو */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-500 hover:text-primary transition"
          >
            ← العودة إلى المنيو
          </button>
        </div>
      </div>
    </div>
  );
}