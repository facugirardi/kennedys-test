"use client";

import { useEffect, useState } from "react";

/** True while `exportDomElementToPdf` sets `data-pdf-capture-prep` on `document.documentElement`. */
export function usePdfCapturePrep(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    const read = () => setActive(el.getAttribute("data-pdf-capture-prep") === "true");
    read();
    const obs = new MutationObserver(read);
    obs.observe(el, { attributes: true, attributeFilter: ["data-pdf-capture-prep"] });
    return () => obs.disconnect();
  }, []);

  return active;
}
