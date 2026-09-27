import EmptyState from "../common/EmptyState";

interface EmptyCartStateProps {
  onClose?: () => void;
}

export default function EmptyCartState({ onClose }: EmptyCartStateProps) {
  return (
    <EmptyState
      icon="🛒"
      title="سلتك فارغة"
      description="أضف بعض الأطباق من المنيو لتبدأ طلبك"
      action={
        onClose && (
          <button
            onClick={onClose}
            className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-accent transition"
          >
            تصفّح المنيو
          </button>
        )
      }
    />
  );
}