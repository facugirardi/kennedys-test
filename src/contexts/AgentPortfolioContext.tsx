"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isAgentPortfolioClientOrigin,
  isAgentPortfolioHost,
} from "@/lib/agentPortfolioSite";

type AgentPortfolioContextValue = {
  /** true en cualquier ruta servida desde agents-portfolio.com */
  isAgentPortfolioSite: boolean;
};

const AgentPortfolioContext = createContext<AgentPortfolioContextValue>({
  isAgentPortfolioSite: false,
});

export function AgentPortfolioProvider({
  children,
  siteOrigin = "",
}: {
  children: ReactNode;
  siteOrigin?: string;
}) {
  const fromSsr = Boolean(siteOrigin && isAgentPortfolioHost(siteOrigin));
  const [clientMatch, setClientMatch] = useState(false);

  useEffect(() => {
    setClientMatch(isAgentPortfolioClientOrigin());
  }, []);

  const isAgentPortfolioSite = fromSsr || clientMatch;

  const value = useMemo(
    () => ({ isAgentPortfolioSite }),
    [isAgentPortfolioSite]
  );

  return (
    <AgentPortfolioContext.Provider value={value}>
      {children}
    </AgentPortfolioContext.Provider>
  );
}

export function useAgentPortfolioSite(): boolean {
  return useContext(AgentPortfolioContext).isAgentPortfolioSite;
}
