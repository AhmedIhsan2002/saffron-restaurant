import { useSettingsStore } from "../../features/settings/settingsStore";
import heroImage from "../../assets/generated/hero-grill.jpg";

export default function HeroBanner() {
  const settings = useSettingsStore((s) => s.settings);
  const restaurantName = settings?.restaurant_name || "شفرة";
  const tagline = settings?.restaurant_tagline || "تصفّح المنيو واطلب مباشرة من طاولتك";

  return (
    <section className="hero-section">
      <img className="hero-image" src={heroImage} alt="مشاوي شامية من مطعم شفرة" />
      <div className="hero-overlay" />
      <div className="hero-content page-shell">
        <p className="eyebrow"><span /> مطبخ شامي معاصر <span /></p>
        <h1>أهلاً بك في<br /><em>{restaurantName}</em></h1>
        <p className="hero-lead">{tagline}</p>
        <div className="hero-meta">
          <span>طازج يوميًا</span>
          <span className="meta-dot">•</span>
          <span>يُحضّر بحب</span>
          {settings?.working_hours && (
            <>
              <span className="meta-dot">•</span>
              <span>{settings.working_hours.open} — {settings.working_hours.close}</span>
            </>
          )}
        </div>
        <a href="#menu" className="hero-cta">استكشف المنيو <span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
