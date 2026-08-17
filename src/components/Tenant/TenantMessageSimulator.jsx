import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { Send, MessageSquare } from "lucide-react";

export default function TenantMessageSimulator() {
  const [msgContent, setMsgContent] = useState(
    "Hi, I want to rent this property!",
  );
  const [status, setStatus] = useState("");

  const sendTestMessage = async (e) => {
    e.preventDefault();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      setStatus("Please log in first.");
      return;
    }
    const userId = sessionData.session.user.id;

    // Grab a property to test with
    const { data: props, error: propErr } = await supabase
      .from("properties")
      .select("id, owner_id, user_id")
      .limit(1);
    if (propErr || !props || props.length === 0) {
      setStatus("No properties found to message about.");
      return;
    }

    const targetProp = props[0];
    const ownerId = targetProp.owner_id || targetProp.user_id;

    if (userId === ownerId) {
      setStatus(
        "You are logged in as the owner. Switch to a tenant account to test sending tenant messages.",
      );
      return;
    }

    const { error } = await supabase.from("messages").insert([
      {
        property_id: targetProp.id,
        sender_id: userId,
        receiver_id: ownerId,
        content: msgContent,
      },
    ]);

    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("Tenant message successfully sent! Check /messages inbox.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl border border-[#EADBCE] shadow-sm mt-10 space-y-4">
      <div className="flex items-center gap-2 text-[#2D1F1A] font-serif font-bold text-lg">
        <MessageSquare className="w-5 h-5 text-[#C5924E]" /> Tenant Message
        Simulator
      </div>
      <form onSubmit={sendTestMessage} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#6E5D53] mb-1">
            Message Content
          </label>
          <input
            type="text"
            value={msgContent}
            onChange={(e) => setMsgContent(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-[#C5924E] hover:bg-[#b08043] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" /> Send Test Tenant Message
        </button>
      </form>
      {status && <p className="text-xs text-center text-[#6E5D53]">{status}</p>}
    </div>
  );
}
