import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Loader, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, verifyEmail, resendVerificationEmail, loginWithGoogle, loading, needsEmailVerification, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Password validation
  const passwordRequirements = {
    length: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    // Validation
    if (!email || !password || !confirmPassword) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setLocalError("Please enter a valid email");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      await signup(email, password);
      // Wait, we don't redirect yet if verification is needed.
      // If it passes without verification, navigate("/") happens via AuthContext redirect? 
      // AuthContext doesn't redirect. Let's redirect only if not needing verification.
      // Actually we should just let the component handle it via useEffect or just navigate on success.
      // But since we can't easily know if it succeeded here (since signup doesn't return the status),
      // we check `needsEmailVerification` after. However, `signup` throws if it fails.
      // So if it returns, it either succeeded or needs verification.
      // We shouldn't navigate here. We should use an effect on isAuthenticated.
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    if (!verificationCode) {
      setLocalError("Please enter the verification code");
      return;
    }
    try {
      await verifyEmail(verificationCode);
      // We don't navigate here, we will navigate in an effect below
    } catch (err) {}
  };

  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">TrendTube</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        {/* Error Alert */}
        {displayError && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{displayError}</AlertDescription>
          </Alert>
        )}

        {/* Signup or Verification Form */}
        {needsEmailVerification ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-medium text-foreground">
                Verification Code
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                We sent a verification code to {email}. Please enter it below.
              </p>
              <Input
                id="code"
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  setLocalError(null);
                }}
                disabled={loading}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !verificationCode}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-10 gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await resendVerificationEmail();
                    setLocalError("Verification email resent successfully!");
                  } catch (e) {}
                }}
                disabled={loading}
                className="text-sm font-semibold text-primary hover:text-primary/90 transition-colors bg-transparent border-0 cursor-pointer"
              >
                Resend verification email
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLocalError(null);
                }}
                disabled={loading}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError(null);
                  }}
                  disabled={loading}
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Password requirements:</p>
                  <div className="space-y-1">
                    <PasswordRequirement met={passwordRequirements.length}>
                      At least 6 characters
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordRequirements.hasUpper}>
                      One uppercase letter
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordRequirements.hasLower}>
                      One lowercase letter
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordRequirements.hasNumber}>
                      One number
                    </PasswordRequirement>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setLocalError(null);
                  }}
                  disabled={loading}
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2">
                  {password === confirmPassword ? (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Passwords match
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Passwords do not match
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !passwordRequirements.length || password !== confirmPassword}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-10 gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        )}

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Google SSO Button */}
        {!needsEmailVerification && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              clearError();
              loginWithGoogle();
            }}
            disabled={loading}
            className="w-full bg-card border-border text-foreground hover:bg-card/90 mb-6 gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        )}

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="mt-6 text-xs text-muted-foreground text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

interface PasswordRequirementProps {
  met: boolean;
  children: string;
}

const PasswordRequirement = ({ met, children }: PasswordRequirementProps) => (
  <div className="flex items-center gap-2">
    {met ? (
      <CheckCircle className="h-3 w-3 text-green-600" />
    ) : (
      <div className="h-3 w-3 rounded-full border border-muted-foreground" />
    )}
    <span className={met ? "text-green-600 text-xs" : "text-muted-foreground text-xs"}>
      {children}
    </span>
  </div>
);

export default Signup;
