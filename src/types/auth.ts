export interface User {
  id: string;
  email: string;
  /** From API; false = must complete email verification before login */
  verified?: boolean;
  role?: 'admin' | 'client' | 'agent';
  /** Set client-side only by loginAgent() — true means this session came from a B2B
   * AgentPortfolioAccount (a completely separate backend table from this User model), not from a
   * regular website account. Gates access to /agent-portfolio/* — see AgentPortfolioLoggedOut. */
  isAgentPortfolioAccount?: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthday?: string | null;
  nationality?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  /** Relative /uploads path (own upload) or absolute URL (from Google on first Google login). */
  profilePicture?: string | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  loginAgent: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: (user: User | null) => void;
  loading: boolean;
  error: string | null;
}
