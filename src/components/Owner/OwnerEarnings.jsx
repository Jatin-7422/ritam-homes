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
} from "lucide-react";

// Simple bar chart rendered with divs
function BarChart({ data, max }) {
  return (
    <div className="flex items-end gap-2 h-32 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full flex items-end justify-center"
            style={{ height: "100px" }}
          >
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-[#2D1F1A] to-[#C5924E] transition-all duration-500"
              style={{
                height: max > 0 ? `${(d.value / max) * 100}px` : "4px",
                minHeight: "4px",
              }}
            />
          </div>
          <span className="text-[9px] text-[#6E5D53] font-bold">{d.label}</span>
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
          Earnings & Payouts 💰
        </h1>
        <p className="text-sm text-[#6E5D53] mt-1">
          Monitor your monthly rental income, revenue history, and property
          performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E5D53]">This Month</span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#2D1F1A]">
            ₹{stats.thisMonth.toLocaleString("en-IN")}
          </p>
          <div
            className={`flex items-center gap-1 text-xs font-bold ${isUp ? "text-green-600" : "text-red-600"}`}
          >
            {isUp ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(growth)}% vs last month
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E5D53]">Last Month</span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#2D1F1A]">
            ₹{stats.lastMonth.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-[#6E5D53] font-medium">
            Previous month total
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E5D53]">
              Lifetime Revenue
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#2D1F1A]">
            ₹{stats.lifetime.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-green-600 font-bold">
            {bookings.length} confirmed bookings
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E5D53]">
              Active Properties
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-[#2D1F1A]">
            {stats.activeProps}
          </p>
          <span className="text-[10px] text-[#6E5D53]">
            of {properties.length} total
          </span>
        </div>
      </div>

      {/* Chart + Property Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-[#2D1F1A]">
              Monthly Revenue
            </h2>
            <div className="flex items-center gap-1 text-xs text-[#C5924E] font-bold">
              <BarChart3 className="w-4 h-4" /> Last 6 months
            </div>
          </div>
          <BarChart data={chartData} max={chartMax} />
          <div className="flex justify-between text-[10px] text-[#6E5D53]">
            <span>₹0</span>
            <span>₹{(chartMax / 2).toLocaleString("en-IN")}</span>
            <span>₹{chartMax.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Per-property earnings */}
        <div className="bg-white p-6 rounded-3xl border border-[#E3D9CC] shadow-xs space-y-4">
          <h2 className="text-base font-serif font-bold text-[#2D1F1A]">
            Earnings by Property
          </h2>
          {properties.length === 0 ? (
            <p className="text-xs text-[#6E5D53] text-center py-8">
              No properties found.
            </p>
          ) : (
            <div className="space-y-3">
              {properties.map((prop) => {
                const propBookings = bookings.filter(
                  (b) => b.property_id === prop.id,
                );
                const earned = propBookings.reduce(
                  (sum, b) => sum + Number(prop.price || 0),
                  0,
                );
                const pct =
                  stats.lifetime > 0 ? (earned / stats.lifetime) * 100 : 0;
                return (
                  <div key={prop.id} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-[#2D1F1A] line-clamp-1">
                          {prop.title}
                        </p>
                        <p className="text-[10px] text-[#6E5D53]">
                          {prop.location} · {propBookings.length} booking
                          {propBookings.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#C5924E]">
                        ₹{earned.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="h-2 bg-[#F8F5EE] rounded-full overflow-hidden">
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
      <div className="bg-white rounded-3xl border border-[#E3D9CC] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F2ECE4]">
          <h2 className="text-base font-serif font-bold text-[#2D1F1A]">
            Booking Revenue History
          </h2>
          <p className="text-xs text-[#6E5D53] mt-0.5">
            Each confirmed booking contributes its property rent.
          </p>
        </div>
        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-[#C5924E] mx-auto mb-3 opacity-40" />
            <p className="text-sm text-[#6E5D53]">
              No confirmed bookings yet. Accept visit requests to start earning.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F8F5EE] text-[#6E5D53] font-bold">
                  <th className="text-left px-6 py-3">Property</th>
                  <th className="text-left px-6 py-3">Visit Date & Time</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-right px-6 py-3">Rent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4]">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-[#FAF7F2] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#2D1F1A] line-clamp-1 max-w-[200px]">
                      {b.property?.title || "—"}
                    </td>
                    <td className="px-6 py-4 text-[#6E5D53]">
                      {b.date} {b.time_slot ? `at ${b.time_slot}` : ""}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold uppercase text-[10px]">
                        {b.status || "Confirmed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#C5924E]">
                      ₹{Number(b.property?.price || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#F8F5EE] font-bold">
                  <td colSpan={3} className="px-6 py-3 text-[#2D1F1A]">
                    Total Lifetime Revenue
                  </td>
                  <td className="px-6 py-3 text-right text-[#C5924E]">
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
