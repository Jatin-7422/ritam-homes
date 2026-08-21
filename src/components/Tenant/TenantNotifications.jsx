import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Bell, Home } from "lucide-react";

export default function TenantNotifications() {
  const [tenantAlerts, setTenantAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTenantAlerts();

    // Realtime subscription for live property alerts
    const subscription = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if (payload.new.type === "new_property" || !payload.new.user_id) {
            setTenantAlerts((prev) => [payload.new, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchTenantAlerts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("type", "new_property")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setTenantAlerts(data);
    }
    setIsLoading(false);
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
          <div className="py-8 text-center text-xs text-neutral-400">
            Loading...
          </div>
        ) : tenantAlerts.length === 0 ? (
          <div className="py-10 text-center text-xs text-neutral-400">
            No new property alerts.
          </div>
        ) : (
          tenantAlerts.map((alert, idx) => (
            <div
              key={alert.id || idx}
              className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5">
                <Home className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-200 truncate">
                  {alert.title}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  {alert.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
