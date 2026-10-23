import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Input } from '../ui/input1'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import Label from '../label'
import { useForm, Controller } from 'react-hook-form';
import { Checkbox } from '../ui/checkbox'
import { registerUser, verifyCode, resendVerificationCode as resendVerificationCodeApi } from '@/lib/api/auth'
import { getUser } from '@/lib/api/user'
import { useAuth } from '@/src/contexts/AuthContext'
import { User } from '@/src/types/auth'
import { useGoogleLogin } from '@react-oauth/google'
import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext'

const COUNTRY_CODES = [
  { value: '+30', label: '+30 (Greece)' },
  { value: '+1', label: '+1 (USA/Canada)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+34', label: '+34 (Spain)' },
  { value: '+39', label: '+39 (Italy)' },
  { value: '+31', label: '+31 (Netherlands)' },
  { value: '+41', label: '+41 (Switzerland)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+90', label: '+90 (Turkey)' },
  { value: '+7', label: '+7 (Russia)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+55', label: '+55 (Brazil)' },
  { value: '+52', label: '+52 (Mexico)' },
  { value: '+54', label: '+54 (Argentina)' },
];

type FormData = {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  newsletter: boolean;
};

type Step = 'login' | 'registerChoice' | 'registerEmail' | 'registerDetails' | 'verification' | 'success';

interface Props {
  setShowRegisterForm: (show: boolean) => void;
  returnTo?: string;
  /** Which step to open on. Defaults to 'login' — the standalone /login page's behavior. */
  initialStep?: Step;
}

const isSafeRedirect = (url?: string): boolean =>
  typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');

export const RegisterForm = ({ setShowRegisterForm, returnTo, initialStep = 'login' }: Props) => {
  const router = useRouter();
  const isAgentPortfolioSite = useAgentPortfolioSite();

  const [currentStep, setCurrentStep] = useState<Step>(initialStep);
  const [otp, setOtp] = useState<string[]>(Array(5).fill(''));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User>({} as User);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordAfterVerify, setPasswordAfterVerify] = useState('');
  const [verificationFromRegister, setVerificationFromRegister] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const resumeVerificationSentRef = useRef<string | null>(null);

  const userAuth = useAuth();

  useEffect(() => {
    if (userAuth.user) {
      setUser(userAuth.user);
    }
  }, [userAuth.user]);

  const passwordValidations = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const { register, handleSubmit, control, formState: { errors }, watch, reset } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      countryCode: '',
      newsletter: false,
    },
  });

  useEffect(() => {
    if (currentStep === 'registerDetails' && email) {
      reset({ email, firstName: '', lastName: '', countryCode: '', phoneNumber: '', password: '', newsletter: false });
    }
  }, [currentStep, email, reset]);

  const watchPassword = watch('password', '');
  useEffect(() => {
    setPassword(watchPassword || '');
  }, [watchPassword]);

  useEffect(() => {
    if (currentStep !== 'verification') {
      resumeVerificationSentRef.current = null;
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 'login') {
      setShowPassword(false);
      reset({ email: '', password: '', firstName: '', lastName: '', countryCode: '', phoneNumber: '', newsletter: false });
    }
  }, [currentStep, reset]);

  useEffect(() => {
    if (currentStep !== 'verification' || verificationFromRegister || !email) return;
    if (resumeVerificationSentRef.current === email) return;
    resumeVerificationSentRef.current = email;

    let cancelled = false;
    void (async () => {
      try {
        const res = await resendVerificationCodeApi({ email });
        if (cancelled) return;
        if (!res?.success) {
          setErrorMessage(res?.message || 'Could not send verification code.');
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Could not send verification code.';
          setErrorMessage(msg);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [currentStep, verificationFromRegister, email]);

  const handleRegisterEmailSubmit = async (data: FormData) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const responseUser = await getUser(data.email);
      const userExists =
        responseUser?.success === true && responseUser?.data && responseUser.data.id;

      if (userExists) {
        const u = responseUser.data as User;
        setUser(u);
        setEmail(data.email.trim());
        setOtp(Array(5).fill(''));
        if (u.verified === false) {
          setVerificationFromRegister(false);
          setCurrentStep('verification');
        } else {
          setErrorMessage('This email already has an account. Please log in instead.');
        }
        return;
      }

      setEmail(data.email.trim());
      setOtp(Array(5).fill(''));
      setCurrentStep('registerDetails');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Could not continue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyWithCode = async (code: string) => {
    if (code.length !== otp.length) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const response = await verifyCode({ email, code });
      if (response.success && response.data) {
        setUser(response.data as User);
        try {
          if (passwordAfterVerify) {
            await userAuth.login(email, passwordAfterVerify);
          }
        } catch (loginErr) {
          console.error('Auto-login after verify failed:', loginErr);
        }
        setPasswordAfterVerify('');
        setCurrentStep('success');
      } else {
        setErrorMessage(response.message || 'Invalid code. Please try again.');
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || error?.message || 'Error verifying code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterDetailsSubmit = async (data: FormData) => {
    if (!isPasswordValid) {
      setErrorMessage('Please meet all password requirements.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const rawPhone = (data.phoneNumber || '').replace(/\s/g, '');
      const phoneNumber = rawPhone ? `${data.countryCode || ''}${rawPhone}` : undefined;
      const response = await registerUser({
        email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber,
        password: data.password,
        newsletter: data.newsletter,
      });

      if (!response?.success) {
        setErrorMessage(response?.message || 'Registration failed. Please try again.');
        return;
      }

      const inner = response.data as { user?: User; verificationCode?: string } | undefined;
      const created = inner?.user;
      if (!created?.id) {
        setErrorMessage('Registration failed. Please try again.');
        return;
      }

      setUser(created);
      setPasswordAfterVerify(data.password || '');
      setOtp(Array(5).fill(''));
      setVerificationFromRegister(true);
      setCurrentStep('verification');
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || error?.message || 'Error creating your account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (data: FormData) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await userAuth.login(data.email, data.password as string);
      setShowRegisterForm(false);
      router.push(isSafeRedirect(returnTo) ? returnTo! : '/my-profile');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Incorrect email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginCredential = async (accessToken: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await userAuth.loginWithGoogle(accessToken);
      setShowRegisterForm(false);
      router.push(isSafeRedirect(returnTo) ? returnTo! : '/my-profile');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleLoginCredential(tokenResponse.access_token),
    onError: () => setErrorMessage('Google login failed. Please try again.'),
    scope: 'openid email profile',
  });

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    const joined = newOtp.join('');
    if (joined.length === otp.length && newOtp.every((d) => d !== '')) {
      void verifyWithCode(joined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResendVerificationCode = async () => {
    if (!email) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await resendVerificationCodeApi({ email });
      if (!res?.success) {
        setErrorMessage(res?.message || 'Could not resend code.');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Could not resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setErrorMessage(null);
    if (currentStep === 'registerChoice') {
      setCurrentStep('login');
    } else if (currentStep === 'registerEmail') {
      setCurrentStep('registerChoice');
    } else if (currentStep === 'registerDetails') {
      setPasswordAfterVerify('');
      setCurrentStep('registerEmail');
    } else if (currentStep === 'verification') {
      setCurrentStep(verificationFromRegister ? 'registerDetails' : 'registerEmail');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'registerChoice':
        return (
          <div className="box-border flex w-full min-w-0 flex-col gap-6 px-4 pt-2 pb-8 sm:px-6 sm:pt-2 sm:pb-10 md:px-4 md:pt-2 md:pb-8">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex w-fit items-center gap-0.5 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
              <span className="text-sm tracking-tight">Go back</span>
            </button>

            <div>
              <h1 className="text-2xl font-normal text-[#333333] md:text-[32px]">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-[#506A70]">
                Choose how you'd like to register
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => googleLogin()}
                className="w-full border border-[#506A70] h-11 text-sm text-[#333333] hover:border-[#172338] hover:text-[#172338] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.576c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.576 9 3.576z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => { setErrorMessage(null); setCurrentStep('registerEmail'); }}
                className="w-full border border-[#506A70] h-11 text-sm text-[#333333] hover:border-[#172338] hover:text-[#172338] transition-colors"
              >
                Continue with email
              </button>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
          </div>
        );

      case 'registerEmail':
        return (
          <div className="box-border flex w-full min-w-0 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 md:px-4 md:py-8">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex w-fit items-center gap-0.5 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
              <span className="text-sm tracking-tight">Go back</span>
            </button>

            <div>
              <h1 className="text-2xl font-normal text-[#333333] md:text-[32px]">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-[#506A70]">
                Enter your email to get started
              </p>
            </div>

            <form onSubmit={handleSubmit(handleRegisterEmailSubmit)} className="flex flex-col gap-4">
              <div>
                <Label mandatory={true} label="Email" />
                <Input
                  className="w-full h-10 rounded-none border-black"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email.message}</span>
                )}
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#172338] text-white w-full h-11 mt-6 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isLoading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          </div>
        );

      case 'login':
        return (
          <div className="box-border flex w-full min-w-0 flex-col gap-6 px-4 pt-2 pb-8 sm:px-6 sm:pt-2 sm:pb-10 md:px-4 md:pt-2 md:pb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex w-fit items-center gap-0.5 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
              <span className="text-sm tracking-tight">Go back</span>
            </button>

            <div>
              <h1 className="text-2xl font-normal text-[#333333] md:text-[32px]">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-[#506A70]">
                Sign in to your account
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleLogin)}
              className="flex flex-col gap-4"
              autoComplete="off"
            >
              <div>
                <Label mandatory={true} label="Email" />
                <Input
                  className="w-full h-10 rounded-none border-black"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  autoComplete="email"
                  spellCheck={false}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email.message}</span>
                )}
              </div>

              <div>
                <Label mandatory={true} label="Password" />
                <div className="relative">
                  <Input
                    className="w-full h-10 rounded-none border-black pr-10"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    autoComplete="current-password"
                    spellCheck={false}
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
                <a
                  href="/forgot-password"
                  className="text-xs text-[#506A70] hover:text-[#172338] transition-colors mt-1 inline-block"
                >
                  Forgot password?
                </a>
                {errors.password && (
                  <span className="text-red-500 text-sm block">{errors.password.message}</span>
                )}
              </div>

              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#172338] text-white w-full h-11 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isLoading ? 'Signing in...' : 'Continue'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => googleLogin()}
              className="w-full border border-[#506A70] h-11 text-sm text-[#333333] hover:border-[#172338] hover:text-[#172338] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.576c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.576 9 3.576z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={() => { setErrorMessage(null); setCurrentStep('registerChoice'); }}
              className="w-full border border-[#506A70] h-11 text-sm text-[#333333] hover:border-[#172338] hover:text-[#172338] transition-colors"
            >
              Create an account
            </button>
          </div>
        );

      case 'verification':
        return (
          <div className="box-border flex h-full w-full min-w-0 flex-col justify-center px-4 pb-8 pt-16 sm:px-6 sm:pt-20 md:px-10">
            <button
              type="button"
              onClick={goBack}
              className="absolute left-3 top-8 z-[5] text-gray-500 hover:text-gray-700 sm:left-5 sm:top-12 md:left-8 md:top-16"
              aria-label="Back"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="mt-4 mb-8 break-words text-center text-xl leading-6 text-[#333333] sm:text-2xl">
              Confirm your email
            </h1>
            <p className="mb-8 text-center text-base text-[#506A70]">
              Enter the verification code we sent to<br />
              <span className="break-all font-semibold text-[#333333]">{email}</span>
            </p>
            <div className="mb-8 flex max-w-full flex-wrap justify-center gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputsRef.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(e.target.value, idx)}
                  onKeyDown={e => handleKeyDown(e, idx)}
                  className="h-11 w-11 shrink-0 border-b-2 border-l-0 border-r-0 border-t-0 border-gray-400 text-center text-lg focus:border-black focus:outline-none focus:ring-0 sm:h-12 sm:w-14 sm:text-xl md:w-16"
                />
              ))}
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>
            )}
            <button
              type="button"
              onClick={() => void handleResendVerificationCode()}
              disabled={isLoading}
              className="underline text-black text-center font-semibold self-center disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send me a new code'}
            </button>
          </div>
        );

      case 'registerDetails':
        return (
          <div className="box-border flex h-full w-full min-w-0 flex-col px-4 pb-10 pt-14 sm:px-6 sm:pt-16 md:px-10 md:pt-20">
            <button
              type="button"
              onClick={goBack}
              className="absolute left-3 top-6 z-[5] text-gray-500 hover:text-gray-700 sm:left-5 sm:top-8 md:left-8 md:top-10"
              aria-label="Back"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="mb-2 break-words text-left text-2xl leading-6 text-[#333333]">
              Create your account
            </h1>
            <p className="mb-8 break-words text-sm text-[#506A70]">
              Signing up as <span className="font-medium text-[#333333]">{email}</span>
            </p>
            <form onSubmit={handleSubmit(handleRegisterDetailsSubmit)} className="flex h-fit w-full min-w-0 flex-col gap-10">
              <div className="flex w-full min-w-0 flex-col gap-5 sm:flex-row sm:justify-between">
                <div className="min-w-0 w-full sm:flex-1">
                  <Label mandatory={true} label="First Name" />
                  <Input
                    className="h-10 w-full rounded-none border-[#506A70]"
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  {errors.firstName && (
                    <span className="text-red-500 text-sm">{errors.firstName.message}</span>
                  )}
                </div>
                <div className="min-w-0 w-full sm:flex-1">
                  <Label mandatory={true} label="Last Name" />
                  <Input
                    className="h-10 w-full rounded-none border-[#506A70]"
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                  {errors.lastName && (
                    <span className="text-red-500 text-sm">{errors.lastName.message}</span>
                  )}
                </div>
              </div>
              <div className="w-full">
                <Label mandatory={true} label="Phone Number" />
                <div className="flex gap-2">
                  <select
                    className="h-10 w-28 shrink-0 rounded-none border border-[#506A70] px-2 font-haas bg-white text-sm"
                    {...register('countryCode', { required: 'Country code is required' })}
                  >
                    <option value="">Code</option>
                    {COUNTRY_CODES.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.value}</option>
                    ))}
                  </select>
                  <Input
                    className="w-full h-10 rounded-none border-[#506A70]"
                    type="tel"
                    placeholder="e.g. 6912345678"
                    {...register('phoneNumber', { required: 'Phone number is required' })}
                  />
                </div>
                {errors.countryCode && (
                  <span className="text-red-500 text-sm">{errors.countryCode.message}</span>
                )}
                {errors.phoneNumber && (
                  <span className="text-red-500 text-sm">{errors.phoneNumber.message}</span>
                )}
              </div>
              <div className="w-full">
                <Label mandatory={true} label="Password" />
                <div className="relative">
                  <Input
                    className={`w-full h-10 rounded-none border-[#506A70] pr-10 ${password ? (isPasswordValid ? 'border-green-500' : 'border-red-500') : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                {errors.password?.type === 'required' && (
                  <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div className="gap-5 flex flex-col">
                <div className="w-full flex gap-2 items-center">
                  <Checkbox className="w-5 h-5 text-white border-[#506A70] data-[state=checked]:bg-soft-gray-dark" />
                  <span className="text-soft-gray-dark font-haas font-light text-sm">
                    I accept the{' '}
                    <a href="" className="text-soft-gray-dark font-haas font-bold text-md underline">Privacy Policy</a>
                  </span>
                </div>
                <Controller
                  name="newsletter"
                  control={control}
                  render={({ field }) => (
                    <div className="w-full flex gap-2 items-center">
                      <Checkbox
                        className="w-5 h-5 text-white border-[#506A70] data-[state=checked]:bg-soft-gray-dark"
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(v === true)}
                      />
                      <span className="min-w-0 break-words text-soft-gray-dark font-haas font-light text-sm">
                        {isAgentPortfolioSite
                          ? 'I want to receive news and updates'
                          : "I want to receive News and updates from Kennedy's Group"}
                      </span>
                    </div>
                  )}
                />
              </div>
              {errorMessage && <span className="text-red-500 text-sm mt-2">{errorMessage}</span>}
              <button
                type="submit"
                disabled={isLoading || !isPasswordValid}
                className="bg-[#172338] text-white w-full h-11 mt-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending code...' : 'Continue'}
              </button>
            </form>
          </div>
        );

      case 'success':
        return (
          <div className="box-border flex h-full w-full min-w-0 flex-col justify-center px-4 py-10 text-center sm:px-8 md:px-12">
            <div className="mb-6 flex h-16 w-16 items-center justify-center self-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 break-words text-left text-2xl font-semibold text-gray-800">
              Your account is confirmed
            </h2>
            <p className="mb-8 break-words text-left text-gray-600">
              Thank you for registering.{' '}
              {userAuth.isAuthenticated
                ? 'You are signed in.'
                : 'You can sign in anytime with your email and password.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowRegisterForm(false);
                if (userAuth.isAuthenticated) {
                  router.push(isSafeRedirect(returnTo) ? returnTo! : '/my-profile');
                }
              }}
              className="bg-[#172338] self-center text-white px-6 py-3 hover:bg-opacity-90 transition-colors"
            >
              {userAuth.isAuthenticated ? 'Go to profile' : 'Close'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full">
      {renderStep()}
    </div>
  );
};
