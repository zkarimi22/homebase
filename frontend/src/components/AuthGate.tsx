"use client";

import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

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

  const showSplash = loading || !minTimeElapsed;

  if (showSplash) {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#0042e6] flex items-center justify-center z-[9999]">
        <Image
          src="/Opendoor-Icon-Logo.wine.svg"
          alt="Homebase"
          width={200}
          height={200}
          className="animate-splash-pulse"
          priority
        />
      </div>
    );
  }

  if (!user && !isLoginPage) return null;

  return <>{children}</>;
}
