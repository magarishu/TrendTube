import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Loader, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      await signup(email, password, username || undefined);
      // Redirect to dashboard on successful signup
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

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

        {/* Signup Form */}
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

          {/* Username Input */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-foreground">
              Username (Optional)
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
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

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

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
