import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Bell, Home, CalendarCheck, MessageSquare, X } from "lucide-react";

export default function TenantNotifications({ currentUserId }) {
  const [tenantAlerts, setTenantAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTenantAlerts();

    // 1. Live DB Notifications (New Property & Booking Status)
    const dbSubscription = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if (
            payload.new.user_id === currentUserId ||
            payload.new.type === "new_property"
          ) {
            setTenantAlerts((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    // 2. Live Chat Messages (Broadcast - ZERO DB storage)
    const broadcastSubscription = supabase
      .channel(`tenant-updates:${currentUserId}`)
      .on("broadcast", { event: "owner_message" }, ({ payload }) => {
        const tempMsg = {
          id: `temp-${Date.now()}`,
          title: payload.title || "New Message from Owner",
          message: payload.message,
          type: "owner_message",
          isTemp: true,
        };
        setTenantAlerts((prev) => [tempMsg, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dbSubscription);
      supabase.removeChannel(broadcastSubscription);
    };
  }, [currentUserId]);

  const fetchTenantAlerts = async () => {
    setIsLoading(true);
    // Fetch stored DB notifications (Booking + Nearby property)
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .in("type", ["new_property", "booking_update"])
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setTenantAlerts(data);
    }
    setIsLoading(false);
  };

  // Close/Dismiss notification (Vanish from UI & DB)
  const handleDismiss = async (alert) => {
    setTenantAlerts((prev) => prev.filter((item) => item.id !== alert.id));

    // DB record hai toh trigger auto-delete kar dega
    if (!alert.isTemp) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", alert.id);
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case "new_property":
        return <Home className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />;
      case "booking_update":
        return <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />;
      case "owner_message":
        return <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-neutral-600" />;
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-[#251B14] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600 dark:text-amber-500" />
          <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            Tenant Updates
          </h4>
        </div>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          {tenantAlerts.length} alerts
        </span>
      </div>

      {/* Notifications List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-neutral-400">Loading...</div>
        ) : tenantAlerts.length === 0 ? (
          <div className="py-10 text-center text-xs text-neutral-400">
            No updates right now.
          </div>
        ) : (
          tenantAlerts.map((alert) => (
            <div
              key={alert.id}
              className="group relative p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                {renderIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-200 truncate">
                  {alert.title}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  {alert.message}
                </p>
              </div>

              {/* Dismiss (X) Button */}
              <button
                onClick={() => handleDismiss(alert)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                title="Dismiss and vanish"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}