import { useState } from "react";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import { Mail, Lock, KeyRound } from "lucide-react";

// AWS Cognito configuration (⚠️ move to environment variables in production)
const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID, // Cognito User Pool ID
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID, // Cognito App Client ID
};

const userPool = new CognitoUserPool(poolData);

/**
 * SignupPage Component
 * - Handles user registration and email verification with AWS Cognito.
 * - Multi-step UI:
 *   1. Account creation (signup).
 *   2. Verification of email with code.
 */
function SignupPage() {
  const [step, setStep] = useState("signup"); // "signup" | "verify"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * Handle user signup.
   * 1. Validate password confirmation.
   * 2. Call Cognito `signUp` with email & password.
   * 3. On success → prompt for verification code.
   */
  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    userPool.signUp(
      email,
      password,
      [{ Name: "email", Value: email }], // Store email as Cognito attribute
      null,
      (err) => {
        setLoading(false);
        if (err) {
          setError(err.message || "Signup failed");
          return;
        }
        setSuccess("Signup successful! Please check your email for a verification code.");
        setStep("verify");
      }
    );
  };

  /**
   * Handle email verification step.
   * 1. Create CognitoUser with email.
   * 2. Call `confirmRegistration` with code.
   * 3. On success → allow login.
   */
  const handleVerification = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const user = new CognitoUser({ Username: email, Pool: userPool });

    user.confirmRegistration(verificationCode, true, (err) => {
      setLoading(false);
      if (err) {
        setError(err.message || "Verification failed");
        return;
      }
      setSuccess("Email verified! You can now log in.");
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/40">
        {/* Title / Step Indicator */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === "signup" ? "Create Your Account" : "Verify Your Email"}
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            {step === "signup"
              ? "Start your journey by creating a secure account"
              : "Enter the 6-digit code we sent to your email"}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            {success}
          </div>
        )}

        {/* Signup Step */}
        {step === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                />
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-[1.01] focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        )}

        {/* Verification Step */}
        {step === "verify" && (
          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500"
                  placeholder="Enter code"
                  onChange={(e) => setVerificationCode(e.target.value)}
                  value={verificationCode}
                />
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-[1.01] focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
