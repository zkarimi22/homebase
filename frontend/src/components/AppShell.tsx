"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth";
import AuthGate from "./AuthGate";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <AuthProvider>
      <AuthGate>
        {isLoginPage ? (
          children
        ) : (
          <>
            <Sidebar />
            <main className="flex-1 ml-[84px] min-h-screen">{children}</main>
          </>
        )}
      </AuthGate>
    </AuthProvider>
  );
}
