import { useState } from "react";
import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import { Mail, Lock } from "lucide-react"; // Lucide icons

// AWS Cognito configuration (replace with env vars in production)
const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID, // Cognito User Pool ID
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID, // Cognito App Client ID
};

const userPool = new CognitoUserPool(poolData);

/**
 * LoginPage Component
 * - Provides login functionality via AWS Cognito.
 * - Handles authentication with JWT token storage.
 *
 * Props:
 * - onLogin {function} → Callback executed after successful login.
 */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Tracks login state
  const [error, setError] = useState(""); // Stores error messages

  /**
   * Handle user login with Cognito.
   * 1. Validate input fields.
   * 2. Build authentication details.
   * 3. Call Cognito `authenticateUser`.
   * 4. On success → store tokens in localStorage.
   * 5. On failure → display error message.
   */
  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const user = new CognitoUser({ Username: email, Pool: userPool });

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        // Extract Cognito tokens
        const idToken = result.getIdToken().getJwtToken();
        const accessToken = result.getAccessToken().getJwtToken();

        // Store tokens locally (⚠️ In production, use secure storage strategy)
        localStorage.setItem("token", idToken);
        localStorage.setItem("idToken", idToken);
        localStorage.setItem("accessToken", accessToken);

        setLoading(false);
        onLogin({ email, token: idToken });
      },
      onFailure: (err) => {
        setLoading(false);
        setError(err.message || "Login failed");
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/30 backdrop-blur-xl shadow-2xl p-8 border border-white/40">
        {/* Title / Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome Back 👋
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Log in to access your secure files
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            {error}
          </div>
        )}

        {/* Email Input */}
        <div className="mb-4">
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

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            <input
              type="password"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-[1.01] disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-indigo-600 hover:underline font-medium"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
