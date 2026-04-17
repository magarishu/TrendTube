import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Loader, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    // Validation
    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setLocalError("Please enter a valid email");
      return;
    }

    try {
      await login(email, password);
      // Redirect to dashboard on successful login
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
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Error Alert */}
        {displayError && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{displayError}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
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
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-10 gap-2"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:text-primary/90 transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 rounded-lg bg-card border border-border">
          <p className="text-xs font-semibold text-foreground mb-2">Demo Credentials:</p>
          <p className="text-xs text-muted-foreground mb-1">
            <span className="text-primary">Email:</span> demo@example.com
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="text-primary">Password:</span> password123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
