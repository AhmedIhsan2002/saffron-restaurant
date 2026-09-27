interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "حدث خطأ غير متوقع",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-primary mb-2">تعذّر التحميل</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-accent text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}