"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Building2, Sparkles, ChevronRight, Loader2, Hexagon, Circle, Square } from "lucide-react";

const PORTALS = [
  { role: "student", label: "Student Portal", description: "Your campus dashboard" },
  { role: "admin", label: "Admin Panel", description: "System administration" },
  { role: "teacher", label: "Faculty Portal", description: "Teaching & department" },
  { role: "department-head", label: "Department", description: "Department administration" },
];

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function AuthPage() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const dashboards: Record<string, string> = {
          student: "/student/dashboard",
          admin: "/admin/dashboard",
          teacher: "/teacher/dashboard",
          "department-head": "/department/dashboard",
        };
        router.push(dashboards[payload.role] || "/student/dashboard");
      } catch {
        setChecking(false);
      }
    } else {
      setChecking(false);
    }
  }, [router]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setLoading(false); return; }
        setCookie("token", data.token);
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setLoading(false); return; }
        setCookie("token", data.token);
      }

      const dashboards: Record<string, string> = {
        student: "/student/dashboard",
        admin: "/admin/dashboard",
        teacher: "/teacher/dashboard",
        "department-head": "/department/dashboard",
      };
      router.push(dashboards[role] || "/student/dashboard");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4 } }}
      className="h-screen flex overflow-hidden bg-background"
    >
      {/* Left panel — Brand */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex-col justify-center px-12"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 opacity-[0.04] text-blue-400">
            <Hexagon size={400} strokeWidth={0.5} />
          </div>
          <div className="absolute top-1/3 -left-10 opacity-[0.03] text-cyan-400">
            <Circle size={300} strokeWidth={0.5} />
          </div>
          <div className="absolute bottom-10 right-10 opacity-[0.03] text-purple-500">
            <Square size={250} strokeWidth={0.5} />
          </div>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Building2 size={22} className="text-white" />
              </div>
              <span className="font-heading text-2xl font-semibold text-white tracking-tight">
                CampusOS
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="font-heading text-4xl font-semibold text-white leading-tight mb-3"
          >
            Your campus,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              intelligently connected
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-sm text-white/50 mb-10 max-w-md leading-relaxed"
          >
            AI-powered campus management for modern universities. Streamline
            announcements, resolve complaints, and empower students with instant
            AI assistance.
          </motion.p>
        </div>
      </motion.div>

      {/* Right panel — Login/Signup form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-heading text-lg font-semibold text-foreground">CampusOS</span>
          </div>

          <h2 className="text-xl font-heading font-semibold text-foreground mb-1">
            {isSignup ? "Create account" : "Welcome back"}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {isSignup ? "Sign up for your campus portal" : "Sign in to your campus portal"}
          </p>

          <div className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full h-10 px-3.5 text-sm rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="w-full h-10 px-3.5 text-sm rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-10 px-3.5 text-sm rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-2 block">Select Portal</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-lg border border-border/80 bg-background text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              >
                {PORTALS.map((p) => (
                  <option key={p.role} value={p.role}>
                    {p.label} — {p.description}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password || (isSignup && !name)}
              className="w-full h-10 bg-primary text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {isSignup ? "Create account" : "Sign in"}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsSignup(!isSignup); setError(""); }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles size={12} className="text-cyan-500" />
              <span>Powered by AI — CampusOS v2.0</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
