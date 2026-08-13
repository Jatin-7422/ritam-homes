import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  Loader2,
  Plus,
  MapPin,
  IndianRupee,
  Trash2,
  Home,
  AlertCircle,
} from "lucide-react";

export default function OwnerProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch properties belonging to the logged-in owner
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError("You must be logged in to view your properties.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setProperties(data || []);
    } catch (err) {
      console.error("Error fetching owner properties:", err.message);
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle property deletion
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevents card click navigation when deleting
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;

    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);

      if (error) throw error;

      // Update state to remove deleted property instantly
      setProperties(properties.filter((prop) => prop.id !== id));
    } catch (err) {
      console.error("Error deleting property:", err.message);
      alert("Failed to delete property.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1F1A]">
            My Properties 🏡
          </h1>
          <p className="text-sm text-[#6E5D53] mt-1">
            Manage your listed properties, track status, and add new listings.
          </p>
        </div>
        <button
          onClick={() => navigate("/owner-dashboard/new-property")}
          className="px-5 py-3 bg-[#2D1F1A] hover:bg-[#3E2E27] text-white font-medium text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5924E]" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Properties List / Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EADBCE] shadow-sm p-8">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EADBCE] text-[#C5924E] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#2D1F1A] mb-2">
            No Properties Found
          </h3>
          <p className="text-sm text-[#6E5D53] max-w-md mx-auto mb-6">
            You haven't listed any properties yet. Get started by adding your
            first property for tenants to discover.
          </p>
          <button
            onClick={() => navigate("/owner-dashboard/new-property")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C5924E] hover:bg-[#B4813F] text-white font-medium text-sm rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() =>
                navigate(`/owner-dashboard/property/${property.id}`)
              }
              className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group"
            >
              <div>
                {/* Property Image Banner (Fallback if no image) */}
                <div className="h-48 bg-[#FAF7F2] relative overflow-hidden flex items-center justify-center border-b border-[#EADBCE]">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Home className="w-12 h-12 text-[#C5924E]/40" />
                  )}
                  <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-[#2D1F1A] text-xs font-bold rounded-full shadow-sm border border-[#EADBCE]">
                    Active
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#2D1F1A] line-clamp-1 group-hover:text-[#C5924E] transition-colors">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#6E5D53]">
                    <MapPin className="w-4 h-4 text-[#C5924E] flex-shrink-0" />
                    <span className="line-clamp-1">
                      {property.location || "Location not specified"}
                    </span>
                  </div>

                  <p className="text-xs text-[#6E5D53] line-clamp-2 leading-relaxed">
                    {property.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Footer / Price & Actions */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-[#F2ECE4] mt-4">
                <div className="flex items-center text-[#C5924E] font-bold text-lg">
                  <IndianRupee className="w-4 h-4" />
                  <span>
                    {property.price?.toLocaleString("en-IN") || "N/A"}
                  </span>
                  <span className="text-xs font-normal text-[#6E5D53] ml-1">
                    /month
                  </span>
                </div>

                <button
                  onClick={(e) => handleDelete(e, property.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer z-10"
                  title="Delete Property"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
