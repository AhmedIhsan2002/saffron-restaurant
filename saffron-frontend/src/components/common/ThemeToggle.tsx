import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("saffron-theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("saffron-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button type="button" className="theme-toggle" onClick={() => setDark((value) => !value)} aria-label={dark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}>
      <span aria-hidden="true">{dark ? "☼" : "☾"}</span>
    </button>
  );
}
