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
} from "lucide-react";

// Simple bar chart rendered with divs
function BarChart({ data, max }) {
  return (
    <div className="flex items-end gap-3 h-36 w-full pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="w-full flex items-end justify-center h-[110px] bg-[#FAF7F2] rounded-xl p-1 relative">
            {/* Tooltip on hover */}
            <div className="absolute -top-8 bg-[#2D1F1A] text-white text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
              ₹{d.value.toLocaleString("en-IN")}
            </div>
            <div
              className="w-full rounded-lg bg-gradient-to-t from-[#2D1F1A] to-[#C5924E] transition-all duration-700 shadow-sm group-hover:brightness-110"
              style={{
                height: max > 0 ? `${Math.max((d.value / max) * 100, 6)}px` : "6px",
              }}
            />
          </div>
          <span className="text-[10px] text-[#6E5D53] font-mono font-medium">{d.label}</span>
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
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D1F1A] px-4 md:px-10 py-8 space-y-8 selection:bg-[#C5924E]/20 selection:text-[#2D1F1A]">
      {/* Modern Glassmorphic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/75 border border-[#EADBCE]/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#C5924E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] text-xs font-mono tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> FINANCIAL OVERVIEW
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-[#2D1F1A]">
            Earnings & Payouts
          </h1>
          <p className="text-xs md:text-sm text-[#6E5D53] max-w-xl font-normal">
            Monitor your monthly rental income, revenue history, and property performance metrics in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/80 border border-[#EADBCE] px-4 py-2.5 rounded-2xl shadow-xs relative z-10">
          <div className="w-8 h-8 rounded-xl bg-[#C5924E]/15 text-[#C5924E] flex items-center justify-center font-bold">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#8A7568] uppercase tracking-wider">Lifetime Balance</p>
            <p className="text-sm font-serif font-bold text-[#2D1F1A]">₹{stats.lifetime.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 border border-[#EADBCE]/85 p-6 rounded-2xl shadow-xs space-y-3 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8A7568] uppercase tracking-wider">This Month</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shadow-inner">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#2D1F1A]">
            ₹{stats.thisMonth.toLocaleString("en-IN")}
          </p>
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${isUp ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
            {isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(growth)}% vs last month
          </div>
        </div>

        <div className="bg-white/80 border border-[#EADBCE]/85 p-6 rounded-2xl shadow-xs space-y-3 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8A7568] uppercase tracking-wider">Last Month</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shadow-inner">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#2D1F1A]">
            ₹{stats.lastMonth.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-[#8A7568] font-mono">Previous period revenue</p>
        </div>

        <div className="bg-white/80 border border-[#EADBCE]/85 p-6 rounded-2xl shadow-xs space-y-3 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8A7568] uppercase tracking-wider">Lifetime Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shadow-inner">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#2D1F1A]">
            ₹{stats.lifetime.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-emerald-600 font-mono font-bold">{bookings.length} confirmed bookings</p>
        </div>

        <div className="bg-white/80 border border-[#EADBCE]/85 p-6 rounded-2xl shadow-xs space-y-3 hover:border-[#C5924E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8A7568] uppercase tracking-wider">Active Properties</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#C5924E] shadow-inner">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#2D1F1A]">
            {stats.activeProps}
          </p>
          <p className="text-xs text-[#8A7568] font-mono">Out of {properties.length} total listings</p>
        </div>
      </div>

      {/* Chart + Property Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white/80 border border-[#EADBCE]/85 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-bold text-[#2D1F1A]">Monthly Revenue</h2>
              <p className="text-xs text-[#8A7568] font-mono">Performance over the last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] rounded-xl text-xs font-mono font-bold">
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
        <div className="bg-white/80 border border-[#EADBCE]/85 p-6 rounded-3xl shadow-xs space-y-4">
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
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
              {properties.map((prop) => {
                const propBookings = bookings.filter((b) => b.property_id === prop.id);
                const earned = propBookings.reduce((sum, b) => sum + Number(prop.price || 0), 0);
                const pct = stats.lifetime > 0 ? (earned / stats.lifetime) * 100 : 0;
                
                return (
                  <div key={prop.id} className="space-y-1.5 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]/60">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-[#2D1F1A] line-clamp-1">{prop.title}</p>
                        <p className="text-[10px] text-[#8A7568] font-mono">
                          {prop.location || "Location unlisted"} · {propBookings.length} booking{propBookings.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#C5924E] font-mono">
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
      <div className="bg-white/80 border border-[#EADBCE]/85 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#EADBCE]/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-serif font-bold text-[#2D1F1A]">Booking Revenue History</h2>
            <p className="text-xs text-[#8A7568] font-mono">Comprehensive log of confirmed visits and rent contributions</p>
          </div>
          <span className="px-3 py-1 bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] text-xs font-mono rounded-xl">
            {bookings.length} Total Records
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#C5924E] mx-auto opacity-50" />
            <p className="text-xs font-mono text-[#6E5D53]">No confirmed bookings yet. Accept visit requests to start earning.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#FAF7F2] text-[#8A7568] font-mono uppercase text-[10px] border-b border-[#EADBCE]/60">
                  <th className="px-6 py-3.5">Property</th>
                  <th className="px-6 py-3.5">Visit Date & Time</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Rent Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]/40">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#2D1F1A] max-w-[250px] truncate">
                      {b.property?.title || "—"}
                    </td>
                    <td className="px-6 py-4 text-[#6E5D53] font-mono">
                      {b.date} {b.time_slot ? `at ${b.time_slot}` : ""}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-mono font-bold uppercase text-[10px]">
                        {b.status || "Confirmed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-serif font-bold text-[#C5924E] text-sm">
                      ₹{Number(b.property?.price || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#FAF7F2] font-bold border-t border-[#EADBCE]/60">
                  <td colSpan={3} className="px-6 py-4 text-[#2D1F1A] font-serif">
                    Total Lifetime Revenue
                  </td>
                  <td className="px-6 py-4 text-right text-base text-[#C5924E] font-serif font-bold">
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