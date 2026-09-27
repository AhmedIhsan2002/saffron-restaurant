import { Link, Outlet } from "react-router-dom";

import { useSettingsStore } from "../features/settings/settingsStore";
import ToastContainer from "../components/common/ToastContainer";
import logoMark from "../assets/generated/logo-mark.png";

export default function PublicLayout() {
  const settings = useSettingsStore((s) => s.settings);
  const name = settings?.restaurant_name || "شفرة";
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-full">تخطّ إلى المحتوى</a>
      <main id="main-content" className="flex-1"><Outlet /></main>
      <footer className="site-footer">
        <div className="page-shell footer-content">
          <div>
            <div className="footer-brand"><img src={logoMark} alt="" className="footer-logo" /><div><strong className="brand-name">{name}</strong><p>مذاق شامي يُحكى</p></div></div>
            <p>نقدّم أطباقًا شامية محضّرة بمكونات طازجة واهتمام بالتفاصيل، لتكون كل زيارة ذكرى جميلة.</p>
          </div>
          <div><h3>تواصل معنا</h3><p>{settings?.restaurant_address || "العنوان يضاف من لوحة الإعدادات"}</p>{settings?.restaurant_phone && <a href={`tel:${settings.restaurant_phone}`}>{settings.restaurant_phone}</a>}</div>
          <div><h3>أوقات العمل</h3><p>{settings?.working_hours ? `${settings.working_hours.open} — ${settings.working_hours.close}` : "يوميًا من الصباح حتى المساء"}</p><a href="#menu">تصفح المنيو ←</a></div>
          <Link to="/admin/login" className="admin-login-link">
  دخول الإدارة
</Link>

        </div>
        <div className="page-shell footer-bottom"><span>© 2026 {name}. جميع الحقوق محفوظة.</span><span>صُنع بحب لعشاق الطعام الشامي</span></div>
      </footer>
      <ToastContainer />
    </div>
  );
}
