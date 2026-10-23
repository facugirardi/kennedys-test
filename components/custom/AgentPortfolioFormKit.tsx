import { Checkbox } from "@/components/ui/checkbox";

/** Shared visual language for the logged-out /agent-portfolio experience (apply / sign in / forgot
 * password): a navy-and-paper "dossier" instead of a boxed SaaS card, hairline-underlined fields
 * instead of boxed inputs, and a numbered step rail for the B2B application's real 10-step sequence.
 * Deliberately scoped to this component family rather than the shared shadcn primitives in
 * components/ui/, which are used across the whole site and must keep their own defaults. */

export const INK = "#172338";
export const STONE = "#506A70";
export const GOLD = "#D99330";
export const PAPER = "#FBFAF7";
export const HAIRLINE = "#DDD8CC";
export const FAINT = "#9CA6AD";
/** Skeleton / subtle-fill tone that reads on PAPER (gray-100 looks cold and blue next to it). */
export const SAND = "#EDEAE2";

/** The product's mark — the tool is branded "Agent Portfolio", not the Kennedy's Group logo. Light
 * tone for the navy panes (sidebar, logged-out rail); `size="sm"` for the mobile top bar. */
export function AgentPortfolioWordmark({ size = "lg" }: { size?: "sm" | "lg" }) {
  return (
    <div className="leading-none">
      <p
        className={`font-gtsuper-ds font-light text-white ${
          size === "lg" ? "text-[26px] leading-[1.05]" : "text-lg leading-none"
        }`}
      >
        Agent{size === "lg" ? <br /> : " "}Portfolio
      </p>
    </div>
  );
}

/** Small gold, letter-spaced label above page titles — the "section of the dossier" marker. */
export function Kicker({ index, children }: { index?: string; children: React.ReactNode }) {
  return (
    <p className="font-haas text-[11px] uppercase tracking-[0.22em]" style={{ color: GOLD }}>
      {index && <span className="mr-2">{index}</span>}
      {index && <span className="mr-2 opacity-50">—</span>}
      {children}
    </p>
  );
}

export const fieldInputClass =
  "mt-1.5 w-full rounded-none border-0 border-b border-[#DDD8CC] bg-transparent px-0 py-2 font-haas text-sm text-[#172338] shadow-none transition-colors placeholder:text-[#B8BCC2] focus-visible:border-[#D99330] focus-visible:ring-0";

export const fieldTextareaClass =
  "mt-1.5 w-full min-h-[80px] rounded-none border-0 border-b border-[#DDD8CC] bg-transparent px-0 py-2 font-haas text-sm text-[#172338] shadow-none transition-colors placeholder:text-[#B8BCC2] focus-visible:border-[#D99330] focus-visible:ring-0";

export const fieldLabelClass = "font-haas text-sm text-[#172338]";

export function Req() {
  return <span style={{ color: GOLD }}> *</span>;
}

export function Opt() {
  return <span className="font-normal text-[#B8BCC2]"> (optional)</span>;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 font-haas text-xs text-red-500">{message}</p>;
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldInputClass} appearance-none bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23506A70%22%3E%3Cpath%20d%3D%22M5.25%207.5L10%2012.25%2014.75%207.5H5.25z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.15rem_center] pr-6`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
      {options.map((opt) => (
        <div key={opt} className="flex items-center space-x-2.5">
          <Checkbox
            id={`cb-${opt}`}
            checked={selected.includes(opt)}
            onCheckedChange={() => onToggle(opt)}
            className="rounded-none border-[#DDD8CC] data-[state=checked]:bg-[#D99330] data-[state=checked]:border-[#D99330]"
          />
          <label htmlFor={`cb-${opt}`} className="font-haas text-sm text-[#506A70] leading-snug">
            {opt}
          </label>
        </div>
      ))}
    </div>
  );
}

export function YesNoToggle({
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="flex gap-6">
      {[{ label: yesLabel, val: true }, { label: noLabel, val: false }].map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.val)}
          className={`font-haas text-sm pb-1 border-b-2 transition-colors ${
            value === opt.val
              ? "border-[#D99330] text-[#172338]"
              : "border-transparent text-[#9CA6AD] hover:text-[#172338]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Vertical dossier index for the application's 10 real sections — a table of contents, not a
 * generic circle-and-checkmark stepper. */
export function StepRail({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <ol className="flex flex-col">
      {steps.map((label, i) => {
        const reached = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li
            key={label}
            className="flex items-baseline gap-3 py-2 pl-4 border-l"
            style={{ borderColor: reached ? GOLD : "rgba(255,255,255,0.14)" }}
          >
            <span
              className="font-gtsuper-ds text-sm shrink-0"
              style={{ color: reached ? GOLD : "rgba(255,255,255,0.32)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="font-haas text-sm leading-snug"
              style={{ color: isCurrent ? "#FFFFFF" : reached ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.32)" }}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Full-screen two-pane frame shared by the apply / sign in / forgot-password views: a fixed navy
 * pane (brand mark + context, given via `rail`) and a paper-toned content pane. */
export function AgentPortfolioShell({
  rail,
  toggle,
  children,
}: {
  rail: React.ReactNode;
  toggle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:flex" style={{ backgroundColor: PAPER }}>
      <aside
        className="lg:w-[360px] xl:w-[400px] shrink-0 px-6 py-8 md:px-10 lg:py-14 lg:flex lg:flex-col lg:justify-between"
        style={{ backgroundColor: INK }}
      >
        <AgentPortfolioWordmark />
        <div className="mt-8 lg:mt-14 hidden lg:block">{rail}</div>
        <p className="hidden lg:block font-haas text-xs text-white/30 mt-10">
          Curated villas and concierge services for your clients
        </p>
      </aside>
      <main className="flex-1 flex justify-center px-6 py-10 md:px-10 lg:py-16">
        <div className="w-full max-w-xl">
          {toggle && <div className="flex justify-end mb-8">{toggle}</div>}
          {children}
        </div>
      </main>
    </div>
  );
}
