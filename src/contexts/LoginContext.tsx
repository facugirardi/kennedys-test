import { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface LoginContextType {
  openLoginModal: () => void;
}

const LoginContext = createContext<LoginContextType>({
  openLoginModal: () => {},
});

export function LoginProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const openLoginModal = () => {
    router.push(`/login?returnTo=${encodeURIComponent(router.asPath)}`);
  };

  return (
    <LoginContext.Provider value={{ openLoginModal }}>
      {children}
    </LoginContext.Provider>
  );
}

export function useLoginModal() {
  return useContext(LoginContext);
}
