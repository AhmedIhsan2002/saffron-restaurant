import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
      <p className="mb-6">الصفحة غير موجودة</p>
      <Link to="/" className="bg-accent text-white px-6 py-2 rounded-full">
        عودة للرئيسية
      </Link>
    </div>
  );
}