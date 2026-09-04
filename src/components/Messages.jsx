import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Send, User, Loader2, MessageSquare, Trash2 } from "lucide-react";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch current user ID on mount
  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    }
    getUser();
  }, []);

  // Fetch unique conversations for the current user & listen to updates
  useEffect(() => {
    if (!currentUserId) return;

    async function fetchConversations() {
      setLoadingConversations(true);
      try {
        const { data, error } = await supabase
          .from("messages")
          .select(
            `
            *,
            properties (title, images)
          `,
          )
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .order("created_at", { ascending: false });

        if (error) throw error;

        processConversations(data, currentUserId);
      } catch (err) {
        console.error("Error fetching conversations:", err.message);
      } finally {
        setLoadingConversations(false);
      }
    }

    fetchConversations();

    const globalChannel = supabase
      .channel("global_messages_permanent")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchConversations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [currentUserId]);

  // Helper to group messages into distinct conversations
  const processConversations = (data, userId) => {
    const convoMap = new Map();
    const sortedData = [...(data || [])].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );

    sortedData.forEach((msg) => {
      const partnerId =
        msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const key = `${msg.property_id}-${partnerId}`;

      const isUnread = msg.receiver_id === userId && !msg.is_read;

      if (!convoMap.has(key)) {
        convoMap.set(key, {
          property_id: msg.property_id,
          property_title: msg.properties?.title || "Property Listing",
          property_image: msg.properties?.images?.[0] || "",
          partner_id: partnerId,
          last_message: msg.content,
          created_at: msg.created_at,
          hasUnread: isUnread,
        });
      } else {
        const existing = convoMap.get(key);
        existing.last_message = msg.content;
        existing.created_at = msg.created_at;
        if (isUnread) existing.hasUnread = true;
      }
    });

    const convoArray = Array.from(convoMap.values()).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    setConversations(convoArray);
  };

  // Fetch messages for active chat and mark them as read
  useEffect(() => {
    if (!activeChat || !currentUserId) return;

    async function fetchMessagesAndMarkRead() {
      setLoadingMessages(true);
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("property_id", activeChat.property_id)
          .or(
            `and(sender_id.eq.${currentUserId},receiver_id.eq.${activeChat.partner_id}),and(sender_id.eq.${activeChat.partner_id},receiver_id.eq.${currentUserId})`,
          )
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // Mark unread messages sent TO us by this partner as read in database
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("property_id", activeChat.property_id)
          .eq("sender_id", activeChat.partner_id)
          .eq("receiver_id", currentUserId)
          .eq("is_read", false);

        setConversations((prev) =>
          prev.map((c) =>
            c.property_id === activeChat.property_id &&
            c.partner_id === activeChat.partner_id
              ? { ...c, hasUnread: false }
              : c,
          ),
        );
      } catch (err) {
        console.error("Error fetching chat messages:", err.message);
      } finally {
        setLoadingMessages(false);
      }
    }

    fetchMessagesAndMarkRead();

    const channel = supabase
      .channel(`chat_perm_${activeChat.property_id}_${activeChat.partner_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `property_id=eq.${activeChat.property_id}`,
        },
        async (payload) => {
          const newMsg = payload.new;
          if (
            (newMsg.sender_id === activeChat.partner_id &&
              newMsg.receiver_id === currentUserId) ||
            (newMsg.sender_id === currentUserId &&
              newMsg.receiver_id === activeChat.partner_id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // If incoming message arrives while chat is open, immediately mark it as read
            if (
              newMsg.sender_id === activeChat.partner_id &&
              newMsg.receiver_id === currentUserId
            ) {
              await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", newMsg.id);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, currentUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUserId) return;

    const contentToSend = newMessage.trim();
    setNewMessage("");

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            property_id: activeChat.property_id,
            sender_id: currentUserId,
            receiver_id: activeChat.partner_id,
            content: contentToSend,
            is_read: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    } catch (err) {
      console.error("Error sending message:", err.message);
      alert("Failed to send message.");
    }
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm("Are you sure you want to delete this conversation?"))
      return;

    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("property_id", activeChat.property_id)
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${activeChat.partner_id}),and(sender_id.eq.${activeChat.partner_id},receiver_id.eq.${currentUserId})`,
        );

      if (error) throw error;

      setMessages([]);
      setActiveChat(null);
      setConversations((prev) =>
        prev.filter(
          (c) =>
            !(
              c.property_id === activeChat.property_id &&
              c.partner_id === activeChat.partner_id
            ),
        ),
      );
    } catch (err) {
      console.error("Error deleting conversation:", err.message);
      alert("Failed to delete chat.");
    }
  };

  return (
    <div className="px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1F1A]">
          Messages
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5D53] mt-0.5">
          Chat directly with property owners or interested tenants.
        </p>
      </div>

      <div className="bg-white border border-[#E3D9CC] rounded-3xl shadow-xs flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
        {/* CONVERSATIONS SIDEBAR */}
        <div className="md:col-span-4 border-r border-[#E3D9CC] flex flex-col bg-[#F8F5EE]/40 min-h-0 overflow-hidden">
          <div className="p-4 border-b border-[#E3D9CC] bg-white font-serif font-bold text-xs text-[#2D1F1A] flex-shrink-0">
            Active Chats
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E3D9CC] min-h-0">
            {loadingConversations ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-[#C5924E]" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6E5D53]">
                <MessageSquare className="w-8 h-8 mx-auto text-[#C5924E] mb-2 opacity-60" />
                No messages yet. Start a conversation from a property listing or
                visit request!
              </div>
            ) : (
              conversations.map((convo, idx) => {
                const isActive =
                  activeChat?.property_id === convo.property_id &&
                  activeChat?.partner_id === convo.partner_id;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveChat(convo)}
                    className={`p-4 cursor-pointer transition-colors flex gap-3 items-center relative ${
                      isActive
                        ? "bg-[#C5924E]/10 border-l-4 border-[#C5924E]"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E3D9CC] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {convo.property_image ? (
                        <img
                          src={convo.property_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-[#6E5D53]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="block text-xs font-bold text-[#2D1F1A] truncate">
                          {convo.property_title}
                        </strong>
                        {convo.hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#C5924E] flex-shrink-0 ml-2 animate-pulse" />
                        )}
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${convo.hasUnread ? "font-bold text-[#2D1F1A]" : "text-[#6E5D53]"}`}
                      >
                        {convo.last_message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT WINDOW AREA */}
        <div className="md:col-span-8 flex flex-col bg-white min-h-0 overflow-hidden">
          {activeChat ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-4 border-b border-[#E3D9CC] flex items-center justify-between bg-[#F8F5EE]/30 flex-shrink-0">
                <div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-[#2D1F1A]">
                    {activeChat.property_title}
                  </h3>
                  <span className="text-[10px] text-[#6E5D53]">
                    Secure direct chat
                  </span>
                </div>
                <button
                  onClick={handleDeleteConversation}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  title="Delete Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Chat</span>
                </button>
              </div>

              {/* MESSAGES LIST */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBF9F4] min-h-0">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-[#C5924E]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-[#6E5D53]">
                    Say hello and start the discussion!
                  </div>
                ) : (
                  messages.map((msg, mIdx) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                      <div
                        key={mIdx}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs ${
                            isMe
                              ? "bg-[#2D1F1A] text-white rounded-br-xs"
                              : "bg-white border border-[#E3D9CC] text-[#2D1F1A] rounded-bl-xs shadow-xs"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-[#9E8B7F] mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* MESSAGE INPUT */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#E3D9CC] flex gap-2 bg-white flex-shrink-0"
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C5924E] text-[#2D1F1A] hover:bg-[#b07f3e] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#6E5D53] min-h-0">
              <MessageSquare className="w-12 h-12 text-[#C5924E] mb-3 opacity-50" />
              <strong className="text-sm font-serif text-[#2D1F1A]">
                Select a conversation
              </strong>
              <p className="text-xs text-[#6E5D53] mt-1">
                Choose a chat from the left sidebar to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}