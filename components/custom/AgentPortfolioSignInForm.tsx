import { useState } from "react";
import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/contexts/AuthContext";
import { fieldInputClass, fieldLabelClass } from "@/components/custom/AgentPortfolioFormKit";

const isSafeRedirect = (url?: string): boolean =>
  typeof url === "string" && url.startsWith("/") && !url.startsWith("//");

/** Dedicated sign-in for B2B partners approved via the Request B2B Access flow — deliberately just
 * email/password (no "Create an account" or Google login): those approved credentials are the only
 * way in now, self-registration is gone. See AgentPortfolioLoggedOut.tsx for the toggle with the
 * application form. */
export default function AgentPortfolioSignInForm({ returnTo, onForgotPassword }: { returnTo: string; onForgotPassword: () => void }) {
  const router = useRouter();
  const { loginAgent } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginAgent(email.trim().toLowerCase(), password);
      router.push(isSafeRedirect(returnTo) ? returnTo : "/agent-portfolio");
    } catch (err: any) {
      setErrorMessage(err?.message?.trim() || "Incorrect email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-gtsuper-ds text-3xl font-light text-[#172338]">B2B Portal sign in</h1>
      <p className="mt-3 font-haas text-sm leading-relaxed text-[#506A70]">
        Sign in with the credentials you received after your B2B access request was approved.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6" autoComplete="off">
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
        <div>
          <label className={fieldLabelClass}>Password</label>
          <div className="relative">
            <Input
              className={`${fieldInputClass} pr-10`}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9CA6AD] hover:text-[#172338]"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="button"
            onClick={onForgotPassword}
            className="mt-2 font-haas text-xs text-[#9CA6AD] hover:text-[#172338] transition-colors inline-block"
          >
            Forgot password?
          </button>
        </div>

        {errorMessage && <p className="font-haas text-sm text-red-500">{errorMessage}</p>}

        <Button type="submit" disabled={isLoading} className="mt-2 rounded-none font-normal">
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
