import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data);
      }
    };

    fetchNotifications();

    // Listen for real-time incoming notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsReadAndNavigate = async (notification) => {
    // 1. Mark as read in database
    if (!notification.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
    }

    setIsOpen(false);

    // 2. Route user depending on notification type
    if (notification.type === "message") {
      navigate(`/chat`); // Adjust route based on your chat page setup
    } else if (
      notification.type === "visit_request" ||
      notification.type === "visit_status"
    ) {
      navigate(`/owner-properties`); // Or your bookings page
    } else if (notification.type === "system") {
      navigate(`/owner-properties`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "visit_request":
      case "visit_status":
        return <Calendar className="w-4 h-4 text-amber-500" />;
      default:
        return <Home className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] hover:bg-[#F2ECE1] transition-all cursor-pointer"
      >
        <Bell className="w-4 h-4 text-[#2D1F1A]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#E3D9CC] rounded-3xl shadow-xl p-4 z-50">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3D9CC] mb-3">
            <h4 className="font-serif font-bold text-sm text-[#2D1F1A]">
              Notifications
            </h4>
            <span className="text-[10px] bg-[#C5924E]/10 text-[#2D1F1A] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6E5D53]">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsReadAndNavigate(n)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    n.is_read
                      ? "bg-white border-[#E3D9CC]/60 text-[#6E5D53]"
                      : "bg-[#F8F5EE] border-[#C5924E]/40 text-[#2D1F1A] font-medium shadow-2xs"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-[#E3D9CC] flex-shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="block text-xs truncate text-[#2D1F1A]">
                        {n.title}
                      </strong>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#C5924E]"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E5D53] mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <span className="block text-[9px] text-[#9E8B7F] mt-1">
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
