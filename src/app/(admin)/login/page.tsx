"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crm-auth-wrap">
      <div className="crm-auth-card">
        <div className="crm-auth-header">
          <h1 className="crm-auth-title">BuyTripsNow</h1>
          <div className="crm-auth-subtitle">CONCIERGE MANAGEMENT PORTAL</div>
        </div>

        {errorMsg && (
          <div
            style={{
              background: "rgba(255, 23, 68, 0.1)",
              border: "1px solid rgba(255, 23, 68, 0.3)",
              borderRadius: "4px",
              color: "#ff1744",
              fontSize: "13px",
              padding: "12px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "rgba(255, 255, 255, 0.5)",
                marginBottom: "6px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="concierge@buytripsnow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                background: "#161920",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--r)",
                color: "var(--white)",
                padding: "12px 16px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "rgba(255, 255, 255, 0.5)",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                background: "#161920",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--r)",
                color: "var(--white)",
                padding: "12px 16px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "var(--gold)",
              border: "none",
              borderRadius: "var(--r)",
              color: "var(--ink)",
              padding: "14px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Verifying Credentials..." : "Enter Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
