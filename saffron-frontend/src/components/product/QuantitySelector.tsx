interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (value > min) onChange(value - 1);
  };

  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={decrease}
        disabled={value <= min}
        className="w-10 h-10 rounded-full border-2 border-primary text-primary font-bold text-xl flex items-center justify-center hover:bg-primary hover:text-white transition disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-primary"
        aria-label="إنقاص"
      >
        −
      </button>

      <span className="w-12 text-center text-xl font-bold text-primary">
        {value}
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={value >= max}
        className="w-10 h-10 rounded-full border-2 border-primary text-primary font-bold text-xl flex items-center justify-center hover:bg-primary hover:text-white transition disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-primary"
        aria-label="زيادة"
      >
        +
      </button>
    </div>
  );
}