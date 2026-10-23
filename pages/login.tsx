import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/src/contexts/AuthContext';
import { RegisterForm } from '@/components/custom/RegisterForm';
import registerImage from '@/public/images/register-image.png';
import { SeoHead } from '@/components/seo/SeoHead';
import { SITE_NAME } from '@/lib/seo/config';
import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext';

export async function getStaticProps() {
  return { props: {} };
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const isAgentPortfolioSite = useAgentPortfolioSite();

  const raw = typeof router.query.returnTo === 'string' ? router.query.returnTo : '/';
  const returnTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(returnTo);
    }
  }, [isAuthenticated, loading, returnTo, router]);

  return (
    <>
      <SeoHead
        title={isAgentPortfolioSite ? 'Sign in | Agent Portfolio' : `Sign in | ${SITE_NAME}`}
        description=""
        canonicalPath="/login"
        noindex
        suppressSiteBranding={isAgentPortfolioSite}
      />
      <div className="flex h-screen overflow-hidden">
        {/* Panel izquierdo: imagen (solo en el sitio de viajeros, no white-label) */}
        {!isAgentPortfolioSite && (
          <div className="hidden md:block md:w-2/5 relative flex-shrink-0">
            <img
              src={registerImage.src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        {/* Panel derecho: form */}
        <div className={`w-full overflow-y-auto bg-white ${isAgentPortfolioSite ? '' : 'md:w-3/5'}`}>
          <div className="min-h-full flex flex-col items-center justify-center px-6 md:pl-16 md:pr-8 py-12">
            {!isAgentPortfolioSite && (
              <>
                {/* Logo */}
                <img
                  src="/images/capa-1-3.svg"
                  alt="Kennedy's Group"
                  className="h-7 mb-4"
                />
                {/* Tagline */}
                <p className="font-haas text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-4">
                  Welcomes You
                </p>
              </>
            )}
            {/* Form */}
            <div className="w-full max-w-md">
              <RegisterForm
                returnTo={returnTo}
                setShowRegisterForm={(open) => {
                  if (!open) {
                    if (window.history.length > 1) {
                      router.back();
                    } else {
                      router.push('/');
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
