import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    login({
      name: identifier.trim() || "Admin User",
      email: identifier.trim(),
      role: "admin",
    });

    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <div className="app-shell min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            NANOSOFT
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Attendance Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-slate-900">
              Welcome Back
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email / Employee ID */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email or Employee ID
              </label>

              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Enter your email or employee ID"
                className="w-full h-11 px-4 rounded-lg border border-slate-300
                  text-sm text-slate-900 placeholder:text-slate-400
                  outline-none transition
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 px-4 pr-12 rounded-lg border border-slate-300
                    text-sm text-slate-900 placeholder:text-slate-400
                    outline-none transition
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-sm text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-blue-600
                text-white text-sm font-semibold
                hover:bg-blue-700
                transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Nanosoft. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
