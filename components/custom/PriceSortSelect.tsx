"use client";

import React, { useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown } from "lucide-react";

export type PriceSortValue = "default" | "asc" | "desc";

const OPTIONS: { value: PriceSortValue; label: string; hint: string }[] = [
  { value: "default", label: "Default", hint: "Our selection" },
  { value: "asc", label: "Price: Low to High", hint: "Lowest price first" },
  { value: "desc", label: "Price: High to Low", hint: "Highest price first" },
];

type Props = {
  value: PriceSortValue;
  onChange: (value: PriceSortValue) => void;
  /** Classes of the trigger (height, border, padding) so it matches its neighbours in the bar. */
  triggerClassName?: string;
  ariaLabel?: string;
};

/** Price sort picker for the real estate search bars: a custom panel instead of the native select. */
export function PriceSortSelect({ value, onChange, triggerClassName, ariaLabel = "Sort by price" }: Props) {
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex w-full items-center justify-between gap-2 bg-white text-left font-haas text-[14px] text-[#172338] focus:outline-none ${
            triggerClassName ?? "h-[52px] border border-[#D1D5DB] px-3"
          }`}
        >
          <span className="truncate">{current.label}</span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          role="listbox"
          className="z-[10000] w-[max(var(--radix-popover-trigger-width),16rem)] border border-[#172338]/15 bg-white p-0 shadow-[0_28px_60px_-28px_rgba(23,35,56,0.4)] outline-none"
        >
          <p className="border-b border-[#E2E8EB] px-4 py-3 font-haas text-[11px] uppercase tracking-[0.2em] text-[#506A70]">
            Sort by price
          </p>
          <ul>
            {OPTIONS.map((option) => {
              const selected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-[#F7F5F0] focus-visible:bg-[#F7F5F0] focus-visible:outline-none"
                  >
                    <span className="flex flex-col">
                      <span className={`font-haas text-[14px] text-[#172338] ${selected ? "font-normal" : "font-light"}`}>
                        {option.label}
                      </span>
                      <span className="font-haas text-[12px] font-light text-[#506A70]">{option.hint}</span>
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-[#D99330]" strokeWidth={1.75} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
