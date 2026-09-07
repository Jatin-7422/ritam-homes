import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Building2,
  Loader2,
  CheckCircle2,
  Calendar,
  BarChart3,
  ArrowUp,
  Sparkles,
  Wallet,
  LayoutGrid
} from "lucide-react";

// Simple bar chart rendered with divs
function BarChart({ data, max }) {
  return (
    <div className="flex items-end gap-1.5 sm:gap-3 h-32 sm:h-36 w-full pt-4 overflow-x-auto pb-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 min-w-[32px] sm:min-w-[40px] flex flex-col items-center gap-2 group">
          <div className="w-full flex items-end justify-center h-[90px] sm:h-[110px] bg-[#FAF7F2] rounded-2xl p-1 relative border border-[#EADBCE]/50">
            {/* Tooltip on hover */}
            <div className="absolute -top-8 bg-[#2D1F1A] text-white text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
              ₹{d.value.toLocaleString("en-IN")}
            </div>
            <div
              className="w-full rounded-xl bg-gradient-to-t from-[#2D1F1A] to-[#C5924E] transition-all duration-700 shadow-sm group-hover:brightness-110"
              style={{
                height: max > 0 ? `${Math.max((d.value / max) * 100, 6)}px` : "6px",
              }}
            />
          </div>
          <span className="text-[10px] text-[#6E5D53] font-mono font-medium truncate">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function OwnerEarnings() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    thisMonth: 0,
    lastMonth: 0,
    lifetime: 0,
    activeProps: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Fetch owner's properties
      const { data: props, error: propsError } = await supabase
        .from("properties")
        .select("id, title, location, price")
        .eq("owner_id", session.user.id);

      if (propsError) throw propsError;

      setProperties(props || []);
      const propMap = Object.fromEntries((props || []).map((p) => [p.id, p]));
      const propIds = (props || []).map((p) => p.id);

      if (propIds.length === 0) {
        setLoading(false);
        return;
      }

      // 2. Fetch confirmed booking slots from property_visit_slots
      const { data: slotData, error: slotError } = await supabase
        .from("property_visit_slots")
        .select("*")
        .in("property_id", propIds)
        .or("status.eq.confirmed,is_booked.eq.true");

      if (slotError) throw slotError;

      const enriched = (slotData || []).map((v) => ({
        ...v,
        property: propMap[v.property_id] || {},
      }));

      setBookings(enriched);

      // 3. Compute earnings per confirmed booking
      const now = new Date();
      const thisM = now.getMonth();
      const lastM = thisM === 0 ? 11 : thisM - 1;
      const thisY = now.getFullYear();

      let thisMonth = 0,
        lastMonth = 0,
        lifetime = 0;

      // Build 6-month chart
      const monthChart = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(thisY, thisM - (5 - i), 1);
        return {
          label: MONTHS[d.getMonth()],
          value: 0,
          month: d.getMonth(),
          year: d.getFullYear(),
        };
      });

      enriched.forEach((b) => {
        const price = Number(b.property?.price || 0);
        lifetime += price;
        const created = b.created_at
          ? new Date(b.created_at)
          : b.date
            ? new Date(b.date)
            : null;

        if (created && !isNaN(created.getTime())) {
          if (created.getMonth() === thisM && created.getFullYear() === thisY)
            thisMonth += price;
          if (
            created.getMonth() === lastM &&
            created.getFullYear() === (thisM === 0 ? thisY - 1 : thisY)
          )
            lastMonth += price;
          monthChart.forEach((mc) => {
            if (
              mc.month === created.getMonth() &&
              mc.year === created.getFullYear()
            )
              mc.value += price;
          });
        }
      });

      setStats({
        thisMonth,
        lastMonth,
        lifetime,
        activeProps: enriched
          .map((b) => b.property_id)
          .filter((v, i, a) => a.indexOf(v) === i).length,
      });
      setChartData(monthChart);
    } catch (err) {
      console.error("Earnings fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const growth =
    stats.lastMonth > 0
      ? (((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100).toFixed(
          1,
        )
      : stats.thisMonth > 0
        ? 100
        : 0;
  const isUp = Number(growth) >= 0;
  const chartMax = Math.max(...chartData.map((d) => d.value), 1);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E] mb-2" />
        <p className="text-xs text-[#8A7568] font-mono tracking-wider">Loading financial insights...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D1F1A] px-3 sm:px-6 md:px-10 py-6 sm:py-8 space-y-5 sm:space-y-8 selection:bg-[#C5924E]/20 selection:text-[#2D1F1A]">
      {/* Modern Glassmorphic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/90 border border-[#EADBCE] backdrop-blur-xl p-4 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#C5924E] via-[#dfb175] to-[#2D1F1A]" />
        
        <div className="space-y-1.5 relative z-10 w-full lg:w-auto mt-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] text-[10px] sm:text-xs font-mono tracking-wide">
            <Sparkles className="w-3 h-3" /> FINANCIAL OVERVIEW
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-[#2D1F1A]">
            Earnings & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5D53] max-w-xl font-normal">
            Monitor your monthly rental income, revenue history, and property performance metrics in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#EADBCE] px-3.5 py-2.5 rounded-2xl shadow-inner relative z-10 w-full sm:w-auto justify-start">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#EADBCE] text-[#C5924E] flex items-center justify-center font-bold shadow-xs shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8A7568] uppercase tracking-wider font-bold">Lifetime Balance</p>
            <p className="text-sm sm:text-base font-serif font-bold text-[#2D1F1A]">₹{stats.lifetime.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* 2x2 Matrix Grid Section matching the screenshot's precise card style */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {/* Matrix Card 1: This Month */}
        <div className="bg-white border border-[#EADBCE] p-4 sm:p-6 rounded-3xl shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-serif font-bold text-[#2D1F1A]">This Month</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/80 flex items-center justify-center text-[#C5924E]">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-3xl font-serif font-bold text-[#2D1F1A] tracking-tight">
              ₹{stats.thisMonth.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-mono font-medium mt-1 truncate">
              {isUp ? `+${Math.abs(growth)}% vs last month` : `${growth}% vs last month`}
            </p>
          </div>
        </div>

        {/* Matrix Card 2: Last Month */}
        <div className="bg-white border border-[#EADBCE] p-4 sm:p-6 rounded-3xl shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-serif font-bold text-[#2D1F1A]">Last Month</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/80 flex items-center justify-center text-[#C5924E]">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-3xl font-serif font-bold text-[#2D1F1A] tracking-tight">
              ₹{stats.lastMonth.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] sm:text-xs text-[#8A7568] font-mono font-medium mt-1 truncate">
              Previous revenue
            </p>
          </div>
        </div>

        {/* Matrix Card 3: Lifetime Revenue */}
        <div className="bg-white border border-[#EADBCE] p-4 sm:p-6 rounded-3xl shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-serif font-bold text-[#2D1F1A]">Lifetime</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/80 flex items-center justify-center text-[#C5924E]">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-3xl font-serif font-bold text-[#2D1F1A] tracking-tight">
              ₹{stats.lifetime.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] sm:text-xs text-[#8A7568] font-mono font-medium mt-1 truncate">
              {bookings.length} confirmed bookings
            </p>
          </div>
        </div>

        {/* Matrix Card 4: Active Properties */}
        <div className="bg-white border border-[#EADBCE] p-4 sm:p-6 rounded-3xl shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-serif font-bold text-[#2D1F1A]">Properties</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/80 flex items-center justify-center text-[#C5924E]">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-3xl font-serif font-bold text-[#2D1F1A] tracking-tight">
              {stats.activeProps}
            </p>
            <p className="text-[10px] sm:text-xs text-[#8A7568] font-mono font-medium mt-1 truncate">
              Active listings
            </p>
          </div>
        </div>
      </div>

      {/* Chart + Property Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white/90 border border-[#EADBCE] p-5 sm:p-7 rounded-3xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-serif font-bold text-[#2D1F1A]">Monthly Revenue</h2>
              <p className="text-xs text-[#8A7568] font-mono">Performance over the last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] rounded-xl text-xs font-mono font-bold w-fit">
              <BarChart3 className="w-4 h-4" /> Trends
            </div>
          </div>

          <BarChart data={chartData} max={chartMax} />

          <div className="flex justify-between items-center text-[10px] text-[#8A7568] font-mono pt-2 border-t border-[#FAF7F2]">
            <span>₹0</span>
            <span>₹{(chartMax / 2).toLocaleString("en-IN")}</span>
            <span>₹{chartMax.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Per-property earnings */}
        <div className="bg-white/90 border border-[#EADBCE] p-5 sm:p-7 rounded-3xl shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-serif font-bold text-[#2D1F1A]">Earnings by Property</h2>
            <p className="text-xs text-[#8A7568] font-mono">Revenue share across your real estate portfolio</p>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#EADBCE] rounded-2xl">
              <Building2 className="w-8 h-8 text-[#8A7568] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[#6E5D53] font-mono">No properties found in your account.</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2">
              {properties.map((prop) => {
                const propBookings = bookings.filter((b) => b.property_id === prop.id);
                const earned = propBookings.reduce((sum, b) => sum + Number(prop.price || 0), 0);
                const pct = stats.lifetime > 0 ? (earned / stats.lifetime) * 100 : 0;
                
                return (
                  <div key={prop.id} className="space-y-1.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/60">
                    <div className="flex justify-between items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#2D1F1A] truncate">{prop.title}</p>
                        <p className="text-[10px] text-[#8A7568] font-mono truncate">
                          {prop.location || "Location unlisted"} · {propBookings.length} booking{propBookings.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#C5924E] font-mono shrink-0">
                        ₹{earned.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#EADBCE]/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2D1F1A] to-[#C5924E] transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking History Table */}
      <div className="bg-white/90 border border-[#EADBCE] rounded-3xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-7 border-b border-[#EADBCE]/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-serif font-bold text-[#2D1F1A]">Booking Revenue History</h2>
            <p className="text-xs text-[#8A7568] font-mono">Comprehensive log of confirmed visits and rent contributions</p>
          </div>
          <span className="px-3 py-1 bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] text-xs font-mono rounded-xl w-fit">
            {bookings.length} Total Records
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 sm:p-16 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#C5924E] mx-auto opacity-50" />
            <p className="text-xs font-mono text-[#6E5D53]">No confirmed bookings yet. Accept visit requests to start earning.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[600px]">
              <thead>
                <tr className="bg-[#FAF7F2] text-[#8A7568] font-mono uppercase text-[10px] border-b border-[#EADBCE]/60">
                  <th className="px-5 sm:px-7 py-3.5">Property</th>
                  <th className="px-5 sm:px-7 py-3.5">Visit Date & Time</th>
                  <th className="px-5 sm:px-7 py-3.5">Status</th>
                  <th className="px-5 sm:px-7 py-3.5 text-right">Rent Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]/40">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-5 sm:px-7 py-4 font-bold text-[#2D1F1A] max-w-[200px] sm:max-w-[250px] truncate">
                      {b.property?.title || "—"}
                    </td>
                    <td className="px-5 sm:px-7 py-4 text-[#6E5D53] font-mono whitespace-nowrap">
                      {b.date} {b.time_slot ? `at ${b.time_slot}` : ""}
                    </td>
                    <td className="px-5 sm:px-7 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-mono font-bold uppercase text-[10px]">
                        {b.status || "Confirmed"}
                      </span>
                    </td>
                    <td className="px-5 sm:px-7 py-4 text-right font-serif font-bold text-[#C5924E] text-sm whitespace-nowrap">
                      ₹{Number(b.property?.price || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#FAF7F2] font-bold border-t border-[#EADBCE]/60">
                  <td colSpan={3} className="px-5 sm:px-7 py-4 text-[#2D1F1A] font-serif">
                    Total Lifetime Revenue
                  </td>
                  <td className="px-5 sm:px-7 py-4 text-right text-base text-[#C5924E] font-serif font-bold whitespace-nowrap">
                    ₹{stats.lifetime.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}