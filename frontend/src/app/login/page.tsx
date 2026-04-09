"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Image from "next/image";

type View = "login" | "password" | "register" | "confirm" | "loading";

export default function LoginPage() {
  const { login, register, confirm } = useAuth();
  const router = useRouter();

  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return;
    setView("password");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      setView("loading");
      setTimeout(() => router.push("/"), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { needsConfirmation } = await register(email, password, name);
      if (needsConfirmation) {
        setView("confirm");
      } else {
        await login(email, password);
        setView("loading");
        setTimeout(() => router.push("/"), 1800);
        return;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await confirm(email, code);
      await login(email, password);
      setView("loading");
      setTimeout(() => router.push("/"), 1800);
      return;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (view === "loading") {
    return (
      <div className="min-h-screen bg-[#3B5EFB] flex items-center justify-center">
        <Image
          src="/favicon.ico"
          alt="Homebase"
          width={80}
          height={80}
          className="animate-pulse brightness-0 invert"
          priority
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 flex items-center px-8 py-5 bg-white z-10">
        <div className="flex items-center gap-2.5">
          <Image
            src="/opendoor-img.png"
            alt="Homebase"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-xl font-extrabold tracking-tight">Homebase</span>
        </div>
      </header>

      {/* Form area */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-6">
          {/* Centered logo */}
          <div className="flex justify-center mb-10">
            <Image
              src="/opendoor-img.png"
              alt="Homebase"
              width={200}
              height={280}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {view === "login" && (
            <form onSubmit={handleContinue}>
              <label className="block text-base font-bold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-5 py-4 bg-white border border-black/15 rounded-2xl text-base outline-none focus:border-black/30 transition-colors mb-4"
              />
              <button
                type="submit"
                className="w-full py-4 bg-[#3B5EFB] text-white text-base font-semibold rounded-2xl hover:bg-[#2D4DE0] transition-colors"
              >
                Continue with email
              </button>
              <p className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => { setView("register"); setError(""); }}
                  className="text-[#3B5EFB] text-sm font-medium hover:underline"
                >
                  Create an account
                </button>
              </p>
            </form>
          )}

          {/* Step 2: Password */}
          {view === "password" && (
            <form onSubmit={handleLogin}>
              <p className="text-sm text-black/40 mb-1">{email}</p>
              <label className="block text-base font-bold mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full px-5 py-4 bg-white border border-black/15 rounded-2xl text-base outline-none focus:border-black/30 transition-colors mb-4"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#3B5EFB] text-white text-base font-semibold rounded-2xl hover:bg-[#2D4DE0] transition-colors disabled:opacity-50"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>
              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={() => { setView("login"); setError(""); }}
                  className="text-[#3B5EFB] text-sm font-medium hover:underline"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  className="text-[#3B5EFB] text-sm font-medium hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          )}

          {/* Register */}
          {view === "register" && (
            <form onSubmit={handleRegister}>
              <h2 className="text-2xl font-extrabold tracking-tight mb-6">
                Create your account
              </h2>
              <label className="block text-base font-bold mb-2">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="w-full px-5 py-4 bg-white border border-black/15 rounded-2xl text-base outline-none focus:border-black/30 transition-colors mb-4"
              />
              <label className="block text-base font-bold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-white border border-black/15 rounded-2xl text-base outline-none focus:border-black/30 transition-colors mb-4"
              />
              <label className="block text-base font-bold mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Min 8 chars, uppercase + number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 bg-white border border-black/15 rounded-2xl text-base outline-none focus:border-black/30 transition-colors mb-4"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#3B5EFB] text-white text-base font-semibold rounded-2xl hover:bg-[#2D4DE0] transition-colors disabled:opacity-50"
              >
                {submitting ? "Creating account..." : "Create account"}
              </button>
              <p className="text-center mt-6">
                <span className="text-sm text-black/40">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => { setView("login"); setError(""); }}
                  className="text-[#3B5EFB] text-sm font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Confirm code */}
          {view === "confirm" && (
            <form onSubmit={handleConfirm}>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2">
                Check your email
              </h2>
              <p className="text-sm text-black/40 mb-6">
                We sent a verification code to <strong className="text-black">{email}</strong>
              </p>
              <label className="block text-base font-bold mb-2">
                Verification code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                className="w-full px-5 py-4 bg-white border border-black/15 rounded-2xl text-base outline-none focus:border-black/30 transition-colors mb-4"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#3B5EFB] text-white text-base font-semibold rounded-2xl hover:bg-[#2D4DE0] transition-colors disabled:opacity-50"
              >
                {submitting ? "Verifying..." : "Verify & sign in"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

