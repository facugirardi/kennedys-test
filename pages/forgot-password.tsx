import { useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input1';
import Label from '@/components/label';
import { forgotPassword } from '@/lib/api/auth';
import { SeoHead } from '@/components/seo/SeoHead';
import { SITE_NAME } from '@/lib/seo/config';
import registerImage from '@/public/images/register-image.png';
import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext';

export async function getStaticProps() {
  return { props: {} };
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const isAgentPortfolioSite = useAgentPortfolioSite();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SeoHead
        title={isAgentPortfolioSite ? 'Forgot password | Agent Portfolio' : `Forgot password | ${SITE_NAME}`}
        description=""
        canonicalPath="/forgot-password"
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
              {submitted ? (
                <div className="flex flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
                  <div className="flex h-16 w-16 items-center justify-center self-center rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-normal text-[#333333] md:text-[32px]">
                      Check your email
                    </h1>
                    <p className="mt-3 text-sm text-[#506A70]">
                      If an account exists for <span className="font-semibold text-[#333333]">{email}</span>, we&apos;ve sent a link to reset your password. The link expires in 1 hour.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="bg-[#172338] text-white w-full h-11 disabled:opacity-50 transition-opacity"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="inline-flex w-fit items-center gap-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Go back"
                  >
                    <ChevronLeft size={20} />
                    <span className="text-sm tracking-tight">Back to sign in</span>
                  </button>

                  <div>
                    <h1 className="text-2xl font-normal text-[#333333] md:text-[32px]">
                      Forgot your password?
                    </h1>
                    <p className="mt-2 text-sm text-[#506A70]">
                      Enter your email and we&apos;ll send you a link to reset it.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <Label mandatory={true} label="Email" />
                      <Input
                        className="w-full h-10 rounded-none border-black"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !email.trim()}
                      className="bg-[#172338] text-white w-full h-11 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      {isLoading ? 'Sending...' : 'Send reset link'}
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
