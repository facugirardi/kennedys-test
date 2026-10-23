'use client';

import { useCallback } from 'react';

export type PdfAutoPrintTriggerProps = {
  choiceOpen: boolean;
  branded: boolean;
  onApplyBranded: (next: boolean) => void;
};

export default function PdfAutoPrintTrigger({
  choiceOpen,
  branded,
  onApplyBranded,
}: PdfAutoPrintTriggerProps) {
  const handleSave = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      {choiceOpen && (
        <div
          className="print:hidden fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-branded-choice-title"
        >
          <div className="w-full max-w-md border border-[#E3E8EA] bg-white p-8 shadow-xl">
            <h2 id="pdf-branded-choice-title" className="font-haas text-lg text-[#172338]">
              PDF style
            </h2>
            <p className="mt-2 text-sm text-[#506A70]">
              Choose whether to include Kennedy&apos;s branding (navbar and footer) in the export.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <button
                type="button"
                onClick={() => onApplyBranded(true)}
                className="rounded-none bg-[#172338] px-5 py-2.5 font-haas text-sm text-white hover:bg-[#0f1729] focus:outline-none focus:ring-2 focus:ring-[#D99330]/60"
              >
                Kennedy&apos;s branding
              </button>
              <button
                type="button"
                onClick={() => onApplyBranded(false)}
                className="rounded-none border border-[#172338] bg-white px-5 py-2.5 font-haas text-sm text-[#172338] hover:bg-[#f6f8f9] focus:outline-none focus:ring-2 focus:ring-[#D99330]/60"
              >
                Unbranded
              </button>
            </div>
          </div>
        </div>
      )}
      {!choiceOpen && (
        <div className="print:hidden sticky top-0 z-[100] flex w-full flex-col gap-2 bg-[#172338] py-2.5 px-4 text-sm text-white shadow-md sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-haas text-center text-white/90">Save this page as PDF</span>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-none bg-[#D99330] px-4 py-1.5 font-haas text-white hover:bg-[#c9842b] focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Save
            </button>
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-2 border-t border-white/15 pt-2 sm:w-auto sm:border-0 sm:pt-0">
            <span className="font-haas text-white/80">Layout:</span>
            <button
              type="button"
              onClick={() => onApplyBranded(true)}
              className={`rounded-none px-3 py-1 font-haas text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 ${
                branded ? 'bg-[#D99330] text-white' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              Branded
            </button>
            <button
              type="button"
              onClick={() => onApplyBranded(false)}
              className={`rounded-none px-3 py-1 font-haas text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 ${
                !branded ? 'bg-[#D99330] text-white' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              Unbranded
            </button>
          </div>
        </div>
      )}
    </>
  );
}
