import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input1';
import Label from '@/components/label';
import { resetPassword, agentResetPassword } from '@/lib/api/auth';
import { SeoHead } from '@/components/seo/SeoHead';
import { SITE_NAME } from '@/lib/seo/config';
import registerImage from '@/public/images/register-image.png';
import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext';

export async function getStaticProps() {
  return { props: {} };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const isAgentPortfolioSite = useAgentPortfolioSite();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof router.query.token === 'string' ? router.query.token : null;
    setToken(t);
  }, [router.query.token]);

  const passwordValidations = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing reset token. Please request a new reset link.');
      return;
    }
    if (!isPasswordValid) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // The reset link's domain already tells us which account this token belongs to — the
      // agent-portfolio flow's email links always resolve to agents-portfolio.com (see kennedys-api's
      // resolveSiteBaseUrl), so isAgentPortfolioSite is an accurate signal, not a guess.
      const res = isAgentPortfolioSite
        ? await agentResetPassword(token, password)
        : await resetPassword(token, password);
      if (res?.success) {
        setSuccess(true);
      } else {
        setError(res?.message || 'Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SeoHead
        title={isAgentPortfolioSite ? 'Reset password | Agent Portfolio' : `Reset password | ${SITE_NAME}`}
        description=""
        canonicalPath="/reset-password"
        noindex
        suppressSiteBranding={isAgentPortfolioSite}
      />
      <div className="flex h-screen overflow-hidden">
        {!isAgentPortfolioSite && (
          <div className="hidden md:block md:w-2/5 relative flex-shrink-0">
            <img
              src={registerImage.src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        <div className={`w-full overflow-y-auto bg-white ${isAgentPortfolioSite ? '' : 'md:w-3/5'}`}>
          <div className="min-h-full flex flex-col items-center justify-center px-6 md:pl-16 md:pr-8 py-12">
            {!isAgentPortfolioSite && (
              <>
                <img
                  src="/images/capa-1-3.svg"
                  alt="Kennedy's Group"
                  className="h-7 mb-4"
                />
                <p className="font-haas text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-10">
                  Welcomes You
                </p>
              </>
            )}

            <div className="w-full max-w-md">
              {success ? (
                <div className="flex flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
                  <div className="flex h-16 w-16 items-center justify-center self-center rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-normal text-[#333333] md:text-[32px]">
                      Password updated
                    </h1>
                    <p className="mt-3 text-sm text-[#506A70]">
                      Your password has been reset successfully. You can now sign in with your new password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(isAgentPortfolioSite ? '/agent-portfolio' : '/login')}
                    className="bg-[#172338] text-white w-full h-11 transition-opacity"
                  >
                    Sign in
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
                  <div>
                    <h1 className="text-2xl font-normal text-[#333333] md:text-[32px]">
                      Set new password
                    </h1>
                    <p className="mt-2 text-sm text-[#506A70]">
                      Choose a strong password for your account.
                    </p>
                  </div>

                  {!token && (
                    <p className="text-red-500 text-sm">
                      Invalid or missing reset token. Please{' '}
                      <a href="/forgot-password" className="underline">request a new reset link</a>.
                    </p>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <Label mandatory={true} label="New Password" />
                      <div className="relative">
                        <Input
                          className={`w-full h-10 rounded-none border-black pr-10 ${
                            password ? (isPasswordValid ? 'border-green-500' : 'border-red-500') : ''
                          }`}
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className={`text-sm ${password ? (passwordValidations.minLength ? 'text-green-600' : 'text-red-500') : 'text-gray-400'}`}>
                          • &gt; 7 characters
                        </p>
                        <p className={`text-sm ${password ? (passwordValidations.hasLowercase ? 'text-green-600' : 'text-red-500') : 'text-gray-400'}`}>
                          • 1 lower letter
                        </p>
                        <p className={`text-sm ${password ? (passwordValidations.hasUppercase ? 'text-green-600' : 'text-red-500') : 'text-gray-400'}`}>
                          • 1 Capital letter
                        </p>
                        <p className={`text-sm ${password ? (passwordValidations.hasNumber ? 'text-green-600' : 'text-red-500') : 'text-gray-400'}`}>
                          • 1 number
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label mandatory={true} label="Confirm Password" />
                      <div className="relative">
                        <Input
                          className={`w-full h-10 rounded-none border-black pr-10 ${
                            confirmPassword
                              ? confirmPassword === password
                                ? 'border-green-500'
                                : 'border-red-500'
                              : ''
                          }`}
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowConfirm(!showConfirm)}
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== password && (
                        <p className="text-red-500 text-sm mt-1">Passwords do not match.</p>
                      )}
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !isPasswordValid || !token}
                      className="bg-[#172338] text-white w-full h-11 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      {isLoading ? 'Updating...' : 'Update password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
