import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSignIn, useSignUp, useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

interface User {
  id: string;
  email: string;
  username: string;
  subscription: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  signup: (email: string, password: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => void;
  loading: boolean;
  needsEmailVerification: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { signOut, getToken } = useClerkAuth();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync Clerk token with our context and localStorage for apiClient
  useEffect(() => {
    const syncToken = async () => {
      if (clerkUser) {
        try {
          const jwt = await getToken();
          setToken(jwt);
          if (jwt) localStorage.setItem('authToken', jwt);
        } catch (e) {
          console.error("Failed to get Clerk token", e);
        }
      } else {
        setToken(null);
        localStorage.removeItem('authToken');
      }
    };
    syncToken();
  }, [clerkUser, getToken]);

  // Automatically resume incomplete sign up session
  useEffect(() => {
    if (isSignUpLoaded && signUp && signUp.status === 'MISSING_REQUIREMENTS') {
      setNeedsEmailVerification(true);
    }
  }, [isSignUpLoaded, signUp]);

  const mappedUser: User | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    username: clerkUser.username || clerkUser.firstName || 'User',
    subscription: 'free' // placeholder as Clerk doesn't store this by default
  } : null;

  const login = async (email: string, password: string) => {
    if (!isSignInLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'COMPLETE') {
        await setSignInActive({ session: result.createdSessionId });
      } else {
        throw new Error("Additional verification required. Please use Clerk's UI for full support.");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!isSignInLoaded) return;
    setLoading(true);
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      console.error('Google login error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to login with Google';
      setError(errorMessage);
      setLoading(false); // Only set false on error, as success redirects the page
    }
  };

  const signup = async (email: string, password: string) => {
    if (!isSignUpLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === 'COMPLETE') {
        await setSignUpActive({ session: result.createdSessionId });
      } else if (result.status === 'MISSING_REQUIREMENTS' || result.unverifiedFields?.includes('email_address')) {
         await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
         setNeedsEmailVerification(true);
      } else {
         throw new Error("Additional verification required.");
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to signup';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (code: string) => {
    if (!isSignUpLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'COMPLETE') {
        await setSignUpActive({ session: result.createdSessionId });
        setNeedsEmailVerification(false);
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Invalid verification code';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!isSignUpLoaded) return;
    setLoading(true);
    setError(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    } catch (err: any) {
      console.error('Resend error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to resend verification email';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut();
    localStorage.removeItem('authToken');
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user: mappedUser,
    isAuthenticated: !!clerkUser,
    token,
    login,
    loginWithGoogle,
    signup,
    verifyEmail,
    resendVerificationEmail,
    logout,
    loading: loading || !isUserLoaded,
    needsEmailVerification,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
