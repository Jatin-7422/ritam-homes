import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Heart, MapPin, Loader2, Compass } from "lucide-react";

export default function TenantSaved() {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("saved_properties")
        .select("*, properties(*)")
        .eq("tenant_id", session.user.id);

      if (error) throw error;
      setSavedProperties(data || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EADBCE] text-xs font-semibold text-[#6E5D53]">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Wishlist</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
            Saved Properties ❤️
          </h1>
          <p className="text-sm text-[#6E5D53] max-w-xl">
            Quickly access the homes you have bookmarked for later
            consideration.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
        </div>
      ) : savedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((item) => {
            const prop = item.properties;
            if (!prop) return null;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#EADBCE] overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="p-6 space-y-3">
                  <h3 className="font-serif font-bold text-lg text-[#2D1F1A]">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-[#6E5D53] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C5924E]" />
                    <span>{prop.location || prop.city}</span>
                  </p>
                </div>
                <div className="p-6 pt-0 flex items-center justify-between">
                  <span className="font-serif font-bold text-base text-[#2D1F1A]">
                    ₹{Number(prop.rent || 0).toLocaleString()}/mo
                  </span>
                  <Link
                    to={`/tenant-dashboard/property/${prop.id}`}
                    className="px-4 py-2 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#EADBCE] space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl flex items-center justify-center mx-auto text-rose-500">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#2D1F1A]">
              Your wishlist is empty
            </h3>
            <p className="text-xs text-[#6E5D53]">
              Bookmark properties while exploring to save them here.
            </p>
          </div>
          <Link
            to="/tenant-dashboard/explore"
            className="px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#C5924E]" />
            <span>Explore Properties</span>
          </Link>
        </div>
      )}
    </div>
  );
}
