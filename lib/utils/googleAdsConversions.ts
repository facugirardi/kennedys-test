const CONVERSION_ID = "AW-17888400836/gkt5CK-Y6OkbEMSr7dFC";

function fireConversion() {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "conversion", { send_to: CONVERSION_ID });
  }
}

export const trackContactFormSubmit = fireConversion;
export const trackContactAgentClick = fireConversion;
