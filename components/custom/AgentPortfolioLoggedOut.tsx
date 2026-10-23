import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import B2BApplicationForm, { STEP_LABELS, STEP_ORDER } from "@/components/custom/B2BApplicationForm";
import AgentPortfolioSignInForm from "@/components/custom/AgentPortfolioSignInForm";
import AgentPortfolioForgotPasswordForm from "@/components/custom/AgentPortfolioForgotPasswordForm";
import { AgentPortfolioShell, StepRail } from "@/components/custom/AgentPortfolioFormKit";

type View = "apply" | "signIn" | "forgotPassword";

/** ?view=signIn|forgotPassword deep-links straight into a view — used by middleware.ts, which
 * redirects /login and /forgot-password here on agents-portfolio.com (those generic pages don't
 * exist for this domain anymore) instead of dropping visitors on the apply form with no explanation. */
function useInitialView(): View {
  const router = useRouter();
  const requested = router.query.view;
  if (requested === "signIn" || requested === "forgotPassword") return requested;
  return "apply";
}

/** Shown instead of redirecting to /login when a visitor hits an /agent-portfolio/* page logged out
 * (or logged in without the AGENT role — see the page guards in pages/agent-portfolio/*.tsx). Access
 * is no longer open self-registration: visitors apply via the B2B form below, an admin in
 * kennedys-loggia reviews it, and only on acceptance does a real login account get created and
 * credentials emailed. Toggles to a dedicated agent sign-in and forgot-password (not the site-wide
 * /login or /forgot-password, which still offer self-registration/Google login that don't apply to
 * approved B2B accounts) for agents who already have those credentials. */
export default function AgentPortfolioLoggedOut({ returnTo }: { returnTo: string }) {
  const initialView = useInitialView();
  const [view, setView] = useState<View>("apply");
  const [applyStepIndex, setApplyStepIndex] = useState(0);

  // router.query is empty on the very first render (before Next.js finishes resolving it), so the
  // ?view= param can't just seed useState's initial value — sync once it actually resolves instead.
  useEffect(() => {
    if (initialView !== "apply") setView(initialView);
  }, [initialView]);

  const toggle = view !== "forgotPassword" && (
    <button
      type="button"
      onClick={() => setView(view === "apply" ? "signIn" : "apply")}
      className="font-haas text-sm text-[#172338] underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:decoration-[#172338] focus-visible:outline-none focus-visible:text-primary"
    >
      {view === "apply" ? "Sign in" : "Request B2B access"}
    </button>
  );

  const rail =
    view === "apply" ? (
      <div>
        <p className="font-gtsuper-ds text-2xl font-light text-white leading-snug max-w-[16rem]">
          An introduction, before access.
        </p>
        <p className="mt-3 font-haas text-sm text-white/50 max-w-[16rem]">
          Ten short sections tell our Partnerships Team who you are and how you work.
        </p>
        <div className="mt-10">
          <StepRail steps={STEP_ORDER.map((s) => STEP_LABELS[s])} currentIndex={applyStepIndex} />
        </div>
      </div>
    ) : view === "signIn" ? (
      <p className="font-gtsuper-ds text-2xl font-light text-white leading-snug max-w-[16rem]">
        Your credentials open the door to our private portfolio.
      </p>
    ) : (
      <p className="font-gtsuper-ds text-2xl font-light text-white leading-snug max-w-[16rem]">
        We&apos;ll have you back in shortly.
      </p>
    );

  return (
    <AgentPortfolioShell rail={rail} toggle={toggle}>
      {view === "apply" && <B2BApplicationForm onStepChange={setApplyStepIndex} />}
      {view === "signIn" && (
        <AgentPortfolioSignInForm returnTo={returnTo} onForgotPassword={() => setView("forgotPassword")} />
      )}
      {view === "forgotPassword" && (
        <AgentPortfolioForgotPasswordForm onBackToSignIn={() => setView("signIn")} />
      )}
    </AgentPortfolioShell>
  );
}
