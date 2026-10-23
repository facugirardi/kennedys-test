import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { differenceInCalendarDays, format, parse } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FAINT, GOLD, HAIRLINE, INK, STONE } from "@/components/custom/AgentPortfolioFormKit";

/** Shared by /agent-portfolio/rates (quote dates) and the offer builder's catalogue filters. Values
 * are "yyyy-MM-dd" strings ("" when unset), the same shape the APIs take. */

/** "yyyy-MM-dd" ↔ Date in local time — `new Date("2027-07-12")` would parse as UTC midnight and
 * land on the previous day west of Greenwich. */
const toDate = (value: string) => (value ? parse(value, "yyyy-MM-dd", new Date()) : undefined);
const toIso = (date: Date | undefined) => (date ? format(date, "yyyy-MM-dd") : "");

/** One trigger + range calendar instead of two native date inputs: the stay is picked in two clicks
 * on the same calendar, and the trigger reads back as "12 Jul → 19 Jul · 7 nights". */
export default function StayDatesPicker({
  checkIn,
  checkOut,
  onChange,
  placeholder,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const from = toDate(checkIn);
  const to = toDate(checkOut);
  const nights = from && to ? differenceInCalendarDays(to, from) : 0;

  const handleSelect = (range: DateRange | undefined) => {
    const nextFrom = range?.from;
    // react-day-picker reports a single click as from === to; treat that as "check-in only".
    const nextTo = range?.to && nextFrom && range.to.getTime() !== nextFrom.getTime() ? range.to : undefined;
    onChange(toIso(nextFrom), toIso(nextTo));
    if (nextFrom && nextTo) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="mt-1.5 flex w-full items-center gap-3 border-b py-2 text-left font-haas text-sm transition-colors hover:border-[#9CA6AD] focus-visible:outline-none focus-visible:border-[#D99330]"
          style={{ borderColor: open ? GOLD : HAIRLINE }}
        >
          <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: STONE }} />
          {from ? (
            <span className="flex-1 truncate" style={{ color: INK }}>
              {format(from, "d MMM yyyy")}
              <span style={{ color: FAINT }}> → </span>
              {to ? format(to, "d MMM yyyy") : <span style={{ color: FAINT }}>Check-out</span>}
            </span>
          ) : (
            <span className="flex-1" style={{ color: "#B8BCC2" }}>{placeholder}</span>
          )}
          {nights > 0 && (
            <span className="shrink-0 tabular-nums" style={{ color: STONE }}>
              {nights} night{nights === 1 ? "" : "s"}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        // The trigger sits inside a short `overflow-y-auto` panel (the Rates "Quote" card), whose
        // small visible height Radix would otherwise treat as the available space — wrongly
        // concluding there's no room below and flipping the calendar above the trigger, where it
        // then had nowhere to go either. Pointing collisionBoundary at the whole page instead makes
        // it measure against the real viewport, so it opens below like a normal calendar.
        collisionBoundary={typeof document !== "undefined" ? document.body : undefined}
        className="w-auto max-h-[85vh] overflow-y-auto rounded-none border-[#DDD8CC] bg-white p-0 shadow-lg"
      >
        <Calendar
          mode="range"
          numberOfMonths={2}
          showOutsideDays={false}
          defaultMonth={from}
          selected={{ from, to }}
          onSelect={handleSelect}
          disabled={{ before: new Date() }}
          weekStartsOn={1}
          classNames={{
            caption_label: "font-gtsuper-ds text-base font-light text-[#172338]",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[#EDEAE2]",
            day: "h-9 w-9 p-0 font-haas text-sm font-normal text-[#172338] transition-colors hover:bg-[#EDEAE2] aria-selected:opacity-100",
            day_selected: "!bg-[#172338] !text-white hover:!bg-[#172338]",
            day_range_middle: "aria-selected:!bg-transparent aria-selected:!text-[#172338]",
            day_today: "underline decoration-[#D99330] underline-offset-4",
            head_cell: "w-9 font-haas text-[10px] font-normal uppercase tracking-[0.15em] text-[#9CA6AD]",
          }}
        />
        <div className="flex items-center justify-between border-t px-4 py-2.5" style={{ borderColor: HAIRLINE }}>
          <span className="font-haas text-xs" style={{ color: FAINT }}>
            {!from ? "Select check-in" : !to ? "Select check-out" : `${nights} night${nights === 1 ? "" : "s"}`}
          </span>
          {(from || to) && (
            <button
              type="button"
              onClick={() => onChange("", "")}
              className="font-haas text-xs text-[#506A70] underline-offset-4 hover:text-[#172338] hover:underline"
            >
              Clear dates
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
