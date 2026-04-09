"use client";

import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (loading) return;

    // If Cognito is not configured, allow access (local dev with mock data)
    const poolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
    if (!poolId) return;

    if (!user && !isLoginPage) {
      router.replace("/login");
    }
    if (user && isLoginPage) {
      router.replace("/");
    }
  }, [user, loading, isLoginPage, router]);

  // If Cognito is not configured, render everything (local dev mode)
  const poolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  if (!poolId) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-5 h-5 border-2 border-black/10 border-t-black/50 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isLoginPage) return null;

  return <>{children}</>;
}
