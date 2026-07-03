"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        setUserEmail(session.user?.email || null);
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.push("/login");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0b0c10",
          color: "var(--gold)",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(197, 168, 128, 0.1)",
            borderTopColor: "var(--gold)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>
          Authenticating Concierge Session...
        </div>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="crm-body">
      {/* Sidebar Navigation */}
      <aside className="crm-sidebar" aria-label="Sidebar navigation">
        <div className="crm-sidebar-logo">
          <div className="crm-sidebar-logo-text">BuyTripsNow</div>
          <div className="crm-sidebar-logo-sub">Concierge Portal</div>
        </div>

        <nav className="crm-sidebar-nav" aria-label="Main Navigation">
          <Link
            href="/dashboard"
            className={`crm-nav-item ${pathname === "/dashboard" ? "active" : ""}`}
          >
            <span>💼</span> Leads Pipeline
          </Link>
          <div className="crm-nav-item" style={{ opacity: 0.4, cursor: "not-allowed" }}>
            <span>📄</span> Quotes (Phase 3)
          </div>
          <div className="crm-nav-item" style={{ opacity: 0.4, cursor: "not-allowed" }}>
            <span>👥</span> Concierge Team
          </div>
          <div className="crm-nav-item" style={{ opacity: 0.4, cursor: "not-allowed" }}>
            <span>⚙️</span> Portal Settings
          </div>
        </nav>

        <div className="crm-sidebar-footer">
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.35)",
              marginBottom: "12px",
              paddingInline: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={userEmail || ""}
          >
            Logged in as:<br />
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>{userEmail}</strong>
          </div>
          <button className="crm-logout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content Wrapper */}
      <main className="crm-main">
        {children}
      </main>
    </div>
  );
}
