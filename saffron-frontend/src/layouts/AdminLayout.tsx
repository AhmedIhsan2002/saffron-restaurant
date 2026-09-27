import { useState } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import { authApi } from "../services/authApi";
import ToastContainer from "../components/common/ToastContainer";
import ThemeToggle from "../components/common/ThemeToggle";

const navItems = [
  { to: "/admin/orders", label: "الطلبات" },
  { to: "/admin/categories", label: "الفئات" },
  { to: "/admin/products", label: "المنتجات" },
  { to: "/admin/settings", label: "الإعدادات" },
];

export default function AdminLayout() {
  const { admin, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // تجاهل
    }
    clearAuth();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell min-h-screen bg-gray-100">
      <header className="bg-primary text-white sticky top-0 z-40 shadow-md">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/admin/orders"
              className="font-bold text-base md:text-lg whitespace-nowrap"
            >
              لوحة شفرة
            </Link>

            {/* روابط سطح المكتب */}
            <nav className="hidden md:flex gap-4 text-sm mr-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `transition ${
                      isActive
                        ? "text-accent font-semibold"
                        : "hover:text-accent/80"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden md:inline text-sm opacity-90">
              {admin?.name}
            </span>
            <button
              onClick={handleLogout}
              className="hidden md:inline bg-accent px-3 py-1.5 rounded-full text-sm hover:opacity-90 transition"
            >
              خروج
            </button>

            {/* زر القائمة على الهاتف */}
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition"
              aria-label="القائمة"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* قائمة الهاتف المنسدلة */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 animate-[fadeIn_150ms_ease-out]">
            <nav className="flex flex-col py-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm transition ${
                      isActive
                        ? "bg-white/10 text-accent font-semibold"
                        : "hover:bg-white/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="border-t border-white/10 mt-2 pt-2 px-4 pb-2 flex items-center justify-between">
                <span className="text-sm opacity-90">{admin?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-accent px-3 py-1.5 rounded-full text-sm hover:opacity-90 transition"
                >
                  خروج
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="p-4 md:p-6">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
