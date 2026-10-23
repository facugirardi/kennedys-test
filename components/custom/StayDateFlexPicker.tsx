import { STAY_DATE_FLEX_OPTIONS } from '@/lib/stayDateFlex';

type Props = {
  value: number;
  onChange: (days: number) => void;
  className?: string;
};

export function StayDateFlexPicker({ value, onChange, className = '' }: Props) {
  return (
    <div className={className}>
      <p className="text-[10px] font-haas font-thin text-gray-500 uppercase tracking-wide mb-1.5">
        Date flexibility
      </p>
      <div className="flex flex-wrap gap-1">
        {STAY_DATE_FLEX_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                'px-2 py-1.5 text-[11px] font-haas font-thin rounded-sm border transition',
                selected
                  ? 'border-[#D99330] bg-[#D99330] text-white'
                  : 'border-[#506A70]/40 bg-white text-[#172338] hover:bg-[#EEF2F6]',
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
