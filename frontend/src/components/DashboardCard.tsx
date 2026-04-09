"use client";

import Link from "next/link";
import FadeIn from "./FadeIn";

export default function DashboardCard({
  href,
  title,
  description,
  stat,
  statLabel,
  delay = 0,
}: {
  href: string;
  title: string;
  description: string;
  stat?: string;
  statLabel?: string;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay}>
      <Link
        href={href}
        className="group block border border-black/5 rounded-sm p-8 transition-all hover:border-black/20 hover:shadow-sm"
      >
        <h2 className="font-serif text-2xl mb-2">{title}</h2>
        <p className="text-sm text-black/50 leading-relaxed mb-6">
          {description}
        </p>
        {stat && (
          <div className="pt-4 border-t border-black/5">
            <span className="text-3xl font-serif">{stat}</span>
            {statLabel && (
              <span className="text-xs text-black/40 ml-2 uppercase tracking-wider">
                {statLabel}
              </span>
            )}
          </div>
        )}
        <div className="mt-4 text-xs text-black/30 group-hover:text-black/60 transition-colors">
          View details &rarr;
        </div>
      </Link>
    </FadeIn>
  );
}
