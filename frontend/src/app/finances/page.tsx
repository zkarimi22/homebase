import FadeIn from "@/components/FadeIn";
import { financeSummary, obligations, property } from "@/lib/mock-data";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export default function FinancesPage() {
  const equityPercent = Math.round(
    (financeSummary.equity / financeSummary.home_value) * 100
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 md:px-10 md:py-14">
      <FadeIn>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1">
          Financial Clarity
        </h1>
        <p className="text-black/35 text-base mb-16 font-medium">
          Your payments, investment, and home value at a glance.
        </p>
      </FadeIn>

      {/* Top-level stats */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6">
            <p className="text-[11px] text-black/30 uppercase tracking-widest font-semibold mb-2">
              Estimated Value
            </p>
            <p className="text-3xl font-extrabold tracking-tight">
              ${fmt(financeSummary.home_value)}
            </p>
            <p className="text-xs text-black/25 mt-1 font-medium">
              Purchased at ${fmt(property.purchase_price)}
            </p>
          </div>
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6">
            <p className="text-[11px] text-black/30 uppercase tracking-widest font-semibold mb-2">
              Equity
            </p>
            <p className="text-3xl font-extrabold tracking-tight">
              ${fmt(financeSummary.equity)}
            </p>
            <p className="text-xs text-black/25 mt-1 font-medium">
              {equityPercent}% of home value
            </p>
          </div>
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6">
            <p className="text-[11px] text-black/30 uppercase tracking-widest font-semibold mb-2">
              Mortgage Balance
            </p>
            <p className="text-3xl font-extrabold tracking-tight">
              ${fmt(financeSummary.mortgage_balance)}
            </p>
            <p className="text-xs text-black/25 mt-1 font-medium">
              {financeSummary.interest_rate}% &middot; {financeSummary.loan_term_years}yr fixed
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Equity bar */}
      <FadeIn delay={0.15}>
        <div className="mb-16">
          <div className="flex justify-between text-[11px] text-black/30 mb-2 font-semibold uppercase tracking-wider">
            <span>Equity</span>
            <span>Remaining Balance</span>
          </div>
          <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3B5EFB] rounded-full transition-all duration-1000"
              style={{ width: `${equityPercent}%` }}
            />
          </div>
        </div>
      </FadeIn>

      {/* Monthly obligations */}
      <FadeIn delay={0.2}>
        <h2 className="text-2xl font-extrabold tracking-tight mb-6">
          Monthly obligations
        </h2>
        <div className="bg-white border border-black/[0.06] rounded-2xl divide-y divide-black/[0.04]">
          {obligations.map((ob) => (
            <div
              key={ob.name}
              className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5"
            >
              <div>
                <p className="text-[13px] font-semibold">{ob.name}</p>
                <p className="text-xs text-black/30 font-medium">
                  Due on the {ob.due_day}
                  {ob.due_day === 1 ? "st" : "th"} &middot; {ob.frequency}
                </p>
              </div>
              <p className="text-lg sm:text-xl font-extrabold">${fmt(ob.amount)}</p>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 bg-neutral-50 rounded-b-2xl">
            <p className="text-[13px] font-semibold text-black/40">Total monthly</p>
            <p className="text-xl font-extrabold">
              ${fmt(obligations.reduce((s, o) => s + o.amount, 0))}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Annual costs */}
      <FadeIn delay={0.25} className="mt-16">
        <h2 className="text-2xl font-extrabold tracking-tight mb-6">
          Annual costs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Property Tax", value: financeSummary.property_tax_annual },
            { label: "Insurance", value: financeSummary.insurance_annual },
            { label: "Mortgage (Annual)", value: financeSummary.monthly_payment * 12 },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-black/[0.06] rounded-2xl p-6"
            >
              <p className="text-[11px] text-black/30 uppercase tracking-widest font-semibold mb-2">
                {item.label}
              </p>
              <p className="text-2xl font-extrabold tracking-tight">
                ${fmt(item.value)}
              </p>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
