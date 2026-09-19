import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import {
  Bell,
  MessageSquare,
  Calendar,
  Home,
  CheckCheck,
  Trash2,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial unread notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("is_read", false) // Fetching unread since read items auto-delete via trigger
        .order("created_at", { ascending: false })
        .limit(15);

      if (!error && data) {
        setNotifications(data);
      }
    };

    fetchNotifications();

    // Listen for real-time incoming & deleted notifications
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
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = notifications.length;

  const handleNotificationClick = async (notification) => {
    try {
      // 1. Mark as read in DB (which triggers your backend deletion function)
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      // 2. Remove immediately from UI state
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      setIsOpen(false);

      // 3. Smart Navigation depending on type
      if (notification.type === "message") {
        navigate(notification.reference_id ? `/chat/${notification.reference_id}` : `/chat`);
      } else if (
        notification.type === "visit_request" ||
        notification.type === "visit_status" ||
        notification.type === "booking"
      ) {
        navigate(`/owner-properties`);
      } else {
        navigate(`/owner-properties`);
      }
    } catch (err) {
      console.error("Error handling notification click:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "visit_request":
      case "visit_status":
      case "booking":
        return <Calendar className="w-4 h-4 text-amber-500" />;
      default:
        return <Home className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-[#F8F5EE] dark:bg-neutral-800 border border-[#E3D9CC] dark:border-neutral-700 hover:bg-[#F2ECE1] dark:hover:bg-neutral-700 transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-[#2D1F1A] dark:text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card - Fully responsive for mobile and desktop */}
      {isOpen && (
        <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-x-auto sm:right-0 sm:mt-3 sm:w-96 bg-white dark:bg-[#221A17] border border-[#E3D9CC] dark:border-neutral-800 rounded-3xl shadow-2xl p-4 z-50 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[450px]">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E3D9CC] dark:border-neutral-800 mb-2">
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-sm text-[#2D1F1A] dark:text-white">
                Notifications
              </h4>
              <span className="text-[10px] bg-[#C5924E]/10 text-[#C5924E] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" /> Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List Content */}
          {notifications.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-full bg-[#F8F5EE] dark:bg-neutral-800 text-[#C5924E]">
                <Bell className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-xs font-medium text-[#6E5D53] dark:text-gray-400">
                You're all caught up! No new notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1 pr-1 divide-y divide-[#E3D9CC]/30 dark:divide-neutral-800/50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className="p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 bg-[#F8F5EE]/70 dark:bg-neutral-800/40 border-[#C5924E]/30 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 shadow-2xs group"
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-[#E3D9CC] dark:border-neutral-700 flex-shrink-0 mt-0.5 shadow-xs">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <strong className="block text-xs truncate text-[#2D1F1A] dark:text-white font-bold group-hover:text-[#C5924E] transition-colors">
                        {n.title}
                      </strong>
                      <span className="w-2 h-2 rounded-full bg-[#C5924E] shrink-0"></span>
                    </div>
                    <p className="text-[11px] text-[#6E5D53] dark:text-gray-300 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="block text-[9px] text-[#9E8B7F] dark:text-gray-400 mt-1">
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