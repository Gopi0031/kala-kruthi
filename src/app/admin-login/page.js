"use client";

import "./admin-login.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Log login attempt to database
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: credentials.username.toLowerCase().trim(), 
          password: credentials.password 
        })
      });
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }

    setTimeout(() => {
      if (
        credentials.username.toLowerCase().trim() === "kalakruthi" &&
        credentials.password === "KK@2025"
      ) {
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("admin_user", JSON.stringify({ username: credentials.username.toLowerCase().trim() }));
        router.push("/admin/dashboard");
      } else {
        setError("Invalid username or password");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-icon">
            <FaShieldAlt />
          </div>
          <h1>Admin Login</h1>
          <p>Secure access to dashboard</p>
        </div>

        {/* Error */}
        {error && <div className="admin-error">{error}</div>}

        {/* Form */}
        <form className="admin-form" onSubmit={handleLogin}>
          {/* Username */}
          <div className="admin-field">
            <label>Username</label>
            <div className="admin-input">
              <FaUser />
              <input
                type="text"
                placeholder="Enter username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    username: e.target.value,
                  })
                }
                required
                suppressHydrationWarning
              />
            </div>
          </div>

          {/* Password */}
          <div className="admin-field">
            <label>Password</label>
            <div className="admin-input">
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    password: e.target.value,
                  })
                }
                required
                suppressHydrationWarning
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                suppressHydrationWarning
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            className="login-btn"
            disabled={loading}
            suppressHydrationWarning
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="admin-footer">
          <a href="/">← Back to Website</a>
        </div>
      </div>
    </div>
  );
}
