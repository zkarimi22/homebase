"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  FileText,
  DollarSign,
  Hammer,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/finances", label: "Finances", icon: DollarSign },
  { href: "/projects", label: "Projects", icon: Hammer },
  { href: "/neighborhood", label: "Neighborhood", icon: MapPin },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`hidden md:flex fixed top-3 left-3 bottom-3 z-50 bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] border border-black/[0.04] flex-col justify-between py-5 transition-all duration-300 ease-in-out ${
          expanded ? "w-52" : "w-[60px]"
        }`}
      >
        <div className="flex flex-col gap-0.5">
          {/* Logo */}
          <div className="flex flex-col items-center px-2 mb-6">
            <Image
              src="/opendoor-img.webp"
              alt="Homebase"
              width={40}
              height={40}
              className="rounded-full flex-shrink-0"
            />
            <span
              className={`text-[10px] font-extrabold tracking-wider uppercase mt-1.5 whitespace-nowrap overflow-hidden transition-all duration-300 text-black/40 ${
                expanded ? "opacity-100" : "opacity-0"
              }`}
            >
              Homebase
            </span>
          </div>

          {/* Nav links */}
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 mx-2 px-2.5 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-black/[0.06] text-black"
                    : "text-black/30 hover:bg-black/[0.03] hover:text-black/60"
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2 : 1.7} className="flex-shrink-0" />
                <span
                  className={`text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-0.5">
          <button className="flex items-center gap-3 mx-2 px-2.5 py-2.5 rounded-xl text-black/30 hover:bg-black/[0.03] hover:text-black/60 transition-all duration-200">
            <Settings size={19} strokeWidth={1.7} className="flex-shrink-0" />
            <span
              className={`text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              Settings
            </span>
          </button>
          {user && (
            <button
              onClick={logout}
              className="flex items-center gap-3 mx-2 px-2.5 py-2.5 rounded-xl text-black/30 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            >
              <LogOut size={19} strokeWidth={1.7} className="flex-shrink-0" />
              <span
                className={`text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                  expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                }`}
              >
                Sign out
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/[0.06] flex items-center justify-around px-2 py-2 safe-bottom">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? "text-black" : "text-black/30"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.7} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
