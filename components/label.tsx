import { cn } from "@/lib/utils";

export type LabelType = {
  className?: string;
  mandatory?: boolean;
  info?: boolean;
  label?: string;
  optional?: boolean;
};

function Label({
  className,
  mandatory = true,
  info = false,
  label = "Email",
  optional = false,
}: LabelType) {
  return (
    <div
      className={cn(
        "box-border flex w-full max-w-[479px] flex-row flex-wrap items-end justify-start gap-[var(--gap-9xs)] p-0 text-left text-sm font-haas font-light text-[var(--black)]",
        className
      )}
    >
      <div className="relative inline-block h-6 w-fit shrink-0 leading-[140%] tracking-[0.5px]">
        {label}
      </div>
      {optional && (
        <div className="relative leading-[22px] text-[var(--secondary-30)]">
          (Optional)
        </div>
      )}
      {mandatory && (
        <b className="relative inline-block h-[18px] w-2 shrink-0 leading-[18px] text-[var(--red-600)]">
          *
        </b>
      )}
      {info && (
        <div className="relative flex h-[18px] max-w-[423px] flex-row items-center justify-end">
          <img
            className="relative h-[18px] w-[18px]"
            alt=""
            src="/icon--info.svg"
          />
        </div>
      )}
    </div>
  );
}

export default Label;
