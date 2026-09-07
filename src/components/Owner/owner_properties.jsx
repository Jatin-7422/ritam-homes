import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  IndianRupee, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Home,
  BookmarkCheck,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export default function OwnerProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

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

  const handleStatusChange = async (e, propertyId, newStatus) => {
    e.stopPropagation();
    try {
      const { error: updateError } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", propertyId);

      if (updateError) throw updateError;

      setProperties(properties.map(prop => 
        prop.id === propertyId ? { ...prop, status: newStatus } : prop
      ));
    } catch (err) {
      console.error("Error updating status:", err.message);
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (e, property) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this property and its images?")) return;

    try {
      if (property.images && property.images.length > 0) {
        const filePaths = property.images
          .map((url) => {
            const parts = url.split("/properties/");
            return parts.length > 1 ? parts[1] : null;
          })
          .filter(Boolean);

        if (filePaths.length > 0) {
          await supabase.storage.from("properties").remove(filePaths);
        }
      }

      const { error: dbError } = await supabase
        .from("properties")
        .delete()
        .eq("id", property.id);

      if (dbError) throw dbError;
      setProperties(properties.filter((prop) => prop.id !== property.id));
    } catch (err) {
      console.error("Error deleting property:", err.message);
      alert("Failed to delete property: " + err.message);
    }
  };

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prop.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || (prop.status || "active").toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#C5924E]" />
          <p className="text-xs text-[#8A7568] tracking-wider uppercase font-mono">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#2D1F1A] px-4 md:px-10 py-8 space-y-8 selection:bg-[#C5924E]/20 selection:text-[#2D1F1A]">
      {/* Modern Glassmorphic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/70 border border-[#EADBCE]/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#C5924E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5924E]/10 border border-[#C5924E]/20 text-[#C5924E] text-xs font-mono tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> PROPERTY PORTFOLIO
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-[#2D1F1A]">
              My Properties
            </h1>
            <span className="px-3 py-1 bg-[#C5924E]/15 text-[#9A6B2A] text-xs font-mono font-bold rounded-full border border-[#C5924E]/30 shadow-xs">
              {properties.length} Listed
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#6E5D53] max-w-xl font-normal">
            Manage your real estate inventory, switch status smoothly so tenants stay informed, and add new listings.
          </p>
        </div>

        <button
          onClick={() => navigate("/add-property")}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#2D1F1A] hover:bg-[#3D2C25] text-white text-xs md:text-sm font-medium rounded-xl shadow-md transition-all cursor-pointer w-full lg:w-auto relative z-10"
        >
          <Plus className="w-4 h-4 text-[#C5924E]" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 shadow-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs font-mono">{error}</p>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      {properties.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-[#EADBCE]/85 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7568]" />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-[#EADBCE] rounded-xl text-xs text-[#2D1F1A] placeholder-[#8A7568] focus:outline-none focus:border-[#C5924E] focus:ring-2 focus:ring-[#C5924E]/25 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["all", "active", "rented", "pending"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono capitalize transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-[#C5924E] text-white shadow-sm font-bold"
                    : "bg-[#FAF7F2] text-[#6E5D53] border border-[#EADBCE] hover:bg-[#EADBCE]/50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PROPERTY GRID */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white/50 border border-[#EADBCE]/80 rounded-3xl p-16 text-center max-w-xl mx-auto shadow-xs my-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center mx-auto text-[#C5924E] shadow-inner">
            <Home className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-serif font-bold text-[#2D1F1A]">
            No Properties Found
          </h3>
          <p className="text-xs text-[#6E5D53] max-w-xs mx-auto">
            {properties.length === 0 ? "You haven't listed any properties yet." : "No properties match your filter criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((property) => {
            const propStatus = (property.status || "active").toLowerCase();
            const imageUrl = property.image_url || (property.images && property.images.length > 0 ? property.images[0] : null);

            return (
              <div 
                key={property.id}
                onClick={() => navigate(`/owner-dashboard/property/${property.id}`)}
                className="bg-white/80 border border-[#EADBCE]/85 hover:border-[#C5924E] rounded-2xl overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md flex flex-col group cursor-pointer"
              >
                {/* Image & Status Badge */}
                <div className="relative h-48 bg-[#F0EBE1] overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FAF7F2]">
                      <Home className="w-10 h-10 text-[#C5924E]/40" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1 shadow-sm ${
                      propStatus === 'active' 
                        ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700/50' 
                        : propStatus === 'rented'
                        ? 'bg-blue-900/80 text-blue-200 border border-blue-700/50'
                        : 'bg-amber-900/80 text-amber-200 border border-amber-700/50'
                    }`}>
                      {propStatus === 'active' && <CheckCircle2 className="w-3 h-3" />}
                      {propStatus === 'rented' && <BookmarkCheck className="w-3 h-3" />}
                      {propStatus === 'pending' && <Clock className="w-3 h-3" />}
                      {propStatus}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white font-serif font-bold text-xs shadow">
                    ₹{Number(property.price || 0).toLocaleString('en-IN')} / mo
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#2D1F1A] line-clamp-1 group-hover:text-[#C5924E] transition-colors">
                      {property.title}
                    </h4>
                    <p className="text-[11px] text-[#6E5D53] flex items-center gap-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-[#C5924E] shrink-0" />
                      <span className="truncate">{property.location || "Location not specified"}</span>
                    </p>

                    <p className="text-xs text-[#6E5D53] line-clamp-2 leading-relaxed">
                      {property.description || "No description provided."}
                    </p>

                    {/* Quick Status Selector */}
                    <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] flex items-center justify-between mt-2">
                      <span className="text-[10px] font-mono text-[#6E5D53] uppercase tracking-wider">Status:</span>
                      <div className="flex items-center gap-1">
                        {["active", "rented", "pending"].map((st) => (
                          <button
                            key={st}
                            onClick={(e) => handleStatusChange(e, property.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                              propStatus === st
                                ? st === 'active' ? 'bg-emerald-600 text-white shadow-xs' : st === 'rented' ? 'bg-blue-600 text-white shadow-xs' : 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white text-[#6E5D53] border border-[#EADBCE] hover:bg-[#EADBCE]/50'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#FAF7F2] font-mono">
                    <span className="text-[10px] text-[#8A7568]">ID: {property.id?.slice(0, 8)}</span>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/owner-dashboard/property/${property.id}`); }}
                        title="View Property"
                        className="p-2 bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#C5924E] hover:text-white hover:border-[#C5924E] text-[#6E5D53] rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/edit-property/${property.id}`); }}
                        title="Edit Property"
                        className="p-2 bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#C5924E] hover:text-white hover:border-[#C5924E] text-[#6E5D53] rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, property)}
                        title="Delete Property"
                        className="p-2 bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 text-rose-600 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}