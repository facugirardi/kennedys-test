import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { confirmEmailChange } from '@/lib/api/auth';
import { SeoHead } from '@/components/seo/SeoHead';
import { SITE_NAME } from '@/lib/seo/config';
import registerImage from '@/public/images/register-image.png';
import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext';

export async function getStaticProps() {
  return { props: {} };
}

type Status = 'pending' | 'success' | 'error';

export default function ConfirmEmailChangePage() {
  const router = useRouter();
  const isAgentPortfolioSite = useAgentPortfolioSite();
  const [status, setStatus] = useState<Status>('pending');
  const [message, setMessage] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState<string | null>(null);

  const confirm = useCallback(async (token: string) => {
    try {
      const res = await confirmEmailChange(token);
      if (res?.success) {
        setStatus('success');
        setNewEmail(res?.data?.email ?? null);
      } else {
        setStatus('error');
        setMessage(res?.message || 'This link is invalid or has expired.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'This link is invalid or has expired.');
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const token = typeof router.query.token === 'string' ? router.query.token : null;
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing confirmation link.');
      return;
    }
    confirm(token);
  }, [router.isReady, router.query.token, confirm]);

  return (
    <>
      <SeoHead
        title={isAgentPortfolioSite ? 'Confirm email change | Agent Portfolio' : `Confirm email change | ${SITE_NAME}`}
        description=""
        canonicalPath="/confirm-email-change"
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
              {status === 'pending' && (
                <div className="flex flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
                  <h1 className="text-2xl font-normal text-[#333333] md:text-[32px]">
                    Confirming your new email...
                  </h1>
                </div>
              )}

              {status === 'success' && (
                <div className="flex flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
                  <div className="flex h-16 w-16 items-center justify-center self-center rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-normal text-[#333333] md:text-[32px]">
                      Email updated
                    </h1>
                    <p className="mt-3 text-sm text-[#506A70]">
                      Your account email has been changed{newEmail ? <> to <span className="font-semibold text-[#333333]">{newEmail}</span></> : ''}. Please sign in again with your new email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="bg-[#172338] text-white w-full h-11 transition-opacity"
                  >
                    Sign in
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
                  <div>
                    <h1 className="text-2xl font-normal text-[#333333] md:text-[32px]">
                      Link invalid or expired
                    </h1>
                    <p className="mt-3 text-sm text-[#D04444]">{message}</p>
                    <p className="mt-3 text-sm text-[#506A70]">
                      Please go back to your profile and request a new confirmation link.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/my-profile')}
                    className="bg-[#172338] text-white w-full h-11 transition-opacity"
                  >
                    Back to my profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
