import FadeIn from "@/components/FadeIn";
import { neighborhoodFeed, property } from "@/lib/mock-data";
import { Trash2, Recycle, AlertTriangle, Users } from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  garbage: <Trash2 size={15} />,
  recycling: <Recycle size={15} />,
  alert: <AlertTriangle size={15} />,
  community: <Users size={15} />,
};

const typeColors: Record<string, string> = {
  garbage: "bg-neutral-100 text-black/30",
  recycling: "bg-emerald-50 text-emerald-500",
  alert: "bg-amber-50 text-amber-500",
  community: "bg-blue-50 text-blue-500",
};

export default function NeighborhoodPage() {
  const sorted = [...neighborhoodFeed].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="max-w-5xl mx-auto px-10 py-14">
      <FadeIn>
        <h1 className="text-4xl font-extrabold tracking-tight mb-1">
          Neighborhood
        </h1>
        <p className="text-black/35 text-base mb-16 font-medium">
          Updates for {property.address} and surrounding area.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((item, i) => (
          <FadeIn key={item.id} delay={0.04 * i}>
            <div className="bg-white border border-black/[0.06] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      typeColors[item.type]
                    }`}
                  >
                    {typeIcons[item.type]}
                  </div>
                  <span className="text-[11px] text-black/30 uppercase tracking-widest font-semibold">
                    {item.type}
                  </span>
                </div>
                <span className="text-[11px] text-black/25 font-medium">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h3 className="text-base font-bold mb-1.5">{item.title}</h3>
              <p className="text-sm text-black/35 leading-relaxed">{item.body}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
