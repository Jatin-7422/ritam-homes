import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Heart, MapPin, Loader2, Compass, Trash2, Home } from "lucide-react";

export default function TenantSaved() {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

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

  const handleRemoveFromSaved = async (savedId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setRemovingId(savedId);
      const { error } = await supabase
        .from("saved_properties")
        .delete()
        .eq("id", savedId);

      if (error) throw error;

      setSavedProperties((prev) => prev.filter((item) => item.id !== savedId));
    } catch (err) {
      console.error("Error removing item from saved properties:", err);
      alert("Failed to remove property from wishlist.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-8 border border-[#E3D9CC] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F5EE] border border-[#E3D9CC] text-xs font-semibold text-[#6E5D53]">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
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

            const coverImage =
              prop.image_url || (prop.images && prop.images[0]) || null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#E3D9CC] overflow-hidden shadow-xs flex flex-col justify-between group transition-all hover:shadow-md"
              >
                <div>
                  {/* Image Header */}
                  <div className="relative h-48 w-full bg-[#F8F5EE] overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#9E8B7F]">
                        <Home className="w-10 h-10 stroke-1" />
                      </div>
                    )}

                    {/* Property Type Badge */}
                    {prop.type && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-xs text-[#2D1F1A] font-bold text-[10px] rounded-full shadow-xs border border-[#E3D9CC]">
                        {prop.type}
                      </span>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={(e) => handleRemoveFromSaved(item.id, e)}
                      disabled={removingId === item.id}
                      title="Remove from saved"
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-xs hover:bg-red-50 text-rose-500 rounded-full flex items-center justify-center shadow-xs border border-[#E3D9CC] transition-colors cursor-pointer"
                    >
                      {removingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    {prop.configuration && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5924E]">
                        {prop.configuration}
                      </span>
                    )}
                    <h3 className="font-serif font-bold text-base text-[#2D1F1A] line-clamp-1">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-[#6E5D53] flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C5924E] flex-shrink-0" />
                      <span>{prop.location}</span>
                    </p>
                  </div>
                </div>

                {/* Footer Price & CTA */}
                <div className="p-5 pt-0 flex items-center justify-between border-t border-[#F2ECE1] mt-3 pt-3">
                  <div>
                    <span className="text-[10px] text-[#6E5D53] block">
                      Monthly Rent
                    </span>
                    <span className="font-serif font-bold text-base text-[#2D1F1A]">
                      ₹{Number(prop.price || 0).toLocaleString()}
                    </span>
                  </div>
                  <Link
                    to={`/tenant-dashboard/property/${prop.id}`}
                    className="px-4 py-2 bg-[#2D1F1A] hover:bg-[#1a110e] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#E3D9CC] space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-[#F8F5EE] border border-[#E3D9CC] rounded-2xl flex items-center justify-center mx-auto text-rose-500">
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
            className="px-5 py-2.5 bg-[#2D1F1A] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 hover:bg-[#1a110e] transition-colors"
          >
            <Compass className="w-4 h-4 text-[#C5924E]" />
            <span>Explore Properties</span>
          </Link>
        </div>
      )}
    </div>
  );
}
