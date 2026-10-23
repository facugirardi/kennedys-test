import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { agentForgotPassword } from "@/lib/api/auth";
import { fieldInputClass, fieldLabelClass, GOLD } from "@/components/custom/AgentPortfolioFormKit";

/** Dedicated "forgot password" for the B2B Portal sign-in — stays inline on /agent-portfolio instead
 * of sending agents to the site-wide /forgot-password page (which resets a website User account, a
 * completely separate table from AgentPortfolioAccount). The backend already white-labels the reset
 * email/link based on the request's Origin (see kennedys-api's isAgentPortfolioRequest), so this
 * just needs to keep the request originating from this page. */
export default function AgentPortfolioForgotPasswordForm({ onBackToSignIn }: { onBackToSignIn: () => void }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      const res: any = await agentForgotPassword(email.trim());
      if (res?.success === false) {
        setError(res?.message || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border" style={{ borderColor: GOLD }}>
          <svg className="h-6 w-6" style={{ color: GOLD }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="font-gtsuper-ds text-2xl font-light text-[#172338]">Check your email</h1>
        <p className="mt-3 font-haas text-sm leading-relaxed text-[#506A70]">
          If a B2B Portal account exists for <span className="font-medium text-[#172338]">{email}</span>, we&apos;ve sent a link to reset the password. The link expires in 1 hour.
        </p>
        <button
          type="button"
          onClick={onBackToSignIn}
          className="mt-6 font-haas text-sm hover:underline"
          style={{ color: GOLD }}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBackToSignIn}
        className="font-haas text-sm text-[#9CA6AD] hover:text-[#172338] transition-colors mb-6"
      >
        Back to sign in
      </button>
      <h1 className="font-gtsuper-ds text-2xl font-light text-[#172338]">Reset your B2B Portal password</h1>
      <p className="mt-3 font-haas text-sm leading-relaxed text-[#506A70]">
        Enter the email on your B2B Portal account and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <label className={fieldLabelClass}>Email</label>
          <Input
            className={fieldInputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        {error && <p className="font-haas text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={isLoading || !email.trim()} className="mt-2 rounded-none">
          {isLoading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
