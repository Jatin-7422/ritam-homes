import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Bell, MessageSquare, Calendar, Building2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OwnerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch unread notifications for the logged-in owner
  const fetchOwnerNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_read", false) // Only fetch unread notifications since read ones disappear
        .order("created_at", { ascending: false })
        .limit(15);

      if (!error && data) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching owner notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerNotifications();

    // Setup Realtime listener for incoming & deleted notifications
    const channel = supabase
      .channel("owner-notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Clicking a notification marks it as read (triggering automatic deletion) and routes accordingly
  const handleNotificationClick = async (item) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", item.id);

      // Optimistically remove from UI state immediately
      setNotifications((prev) => prev.filter((n) => n.id !== item.id));

      // Smart routing based on notification type for owners
      if (item.type === "message") {
        navigate("/owner-dashboard/messages");
      } else if (item.type === "booking" || item.type.includes("slot")) {
        navigate("/owner-dashboard/bookings");
      } else if (item.type === "property_listed") {
        navigate("/owner-dashboard/properties");
      }
    } catch (err) {
      console.error("Error processing owner notification click:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false);

      setNotifications([]);
    } catch (err) {
      console.error("Error clearing owner notifications:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "booking":
      case "slot_booking":
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "property_listed":
        return <Building2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#C5924E]" />;
    }
  };

  return (
    <div className="w-80 sm:w-96 bg-white dark:bg-[#221A17] border border-[#E3D9CC] dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[420px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E3D9CC] dark:border-neutral-800 flex items-center justify-between bg-[#FAF7F2] dark:bg-[#1A120B]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#C5924E]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D1F1A] dark:text-white">Hosting Alerts</h3>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="text-[11px] font-semibold text-rose-500 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Content List */}
      <div className="overflow-y-auto flex-1 divide-y divide-[#E3D9CC]/50 dark:divide-neutral-800/50">
        {loading ? (
          <div className="p-6 text-center text-xs text-gray-400">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
            <Bell className="w-8 h-8 opacity-40 text-[#C5924E]" />
            <p className="text-xs font-medium">No hosting alerts right now</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className="p-3.5 transition-colors flex gap-3 cursor-pointer bg-[#FAF7F2]/60 dark:bg-neutral-800/30 hover:bg-white dark:hover:bg-neutral-800/60"
            >
              <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-neutral-800 shadow-xs border border-[#E3D9CC] dark:border-neutral-700 shrink-0 h-fit">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-[#2D1F1A] dark:text-white truncate">{item.title}</h4>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#C5924E] self-center shrink-0"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}