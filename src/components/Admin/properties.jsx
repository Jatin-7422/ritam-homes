import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Building2, CheckCircle2, XCircle, Eye, Search, MapPin, IndianRupee, Mail, User } from "lucide-react";

export default function PropertiesManagement() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Fetch properties from database
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately to map owner details safely
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email");

      const profileMap = {};
      profilesData?.forEach((p) => {
        profileMap[p.id] = p;
      });

      const formattedProperties = data?.map((prop) => {
        const ownerInfo = profileMap[prop.owner_id] || {};
        return {
          ...prop,
          owner_name: ownerInfo.full_name || prop.owner_name || "Unknown Owner",
          owner_email: ownerInfo.email || "No Email Provided",
        };
      }) || [];

      setProperties(formattedProperties);

      // Keep selection synced if data refreshes
      if (formattedProperties.length > 0) {
        const currentSelected = selectedProperty 
          ? formattedProperties.find(p => p.id === selectedProperty.id) 
          : formattedProperties[0];
          
        setSelectedProperty(currentSelected || formattedProperties[0]);
      } else {
        setSelectedProperty(null);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const updatePropertyStatus = async (propertyId, newStatus) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", propertyId);

      if (error) throw error;

      fetchProperties();
      if (selectedProperty?.id === propertyId) {
        setSelectedProperty({ ...selectedProperty, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating property status:", err);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && (p.status || "Pending").toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3D9CC] shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2D1F1A]">Property Listings Management</h1>
          <p className="text-xs text-[#9E8B7F] mt-1">Manage, audit, and approve real estate listings across the system.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search properties or owners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F7F4EE] border border-[#E3D9CC] rounded-xl focus:outline-none focus:border-[#C5924E]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F7F4EE] border border-[#E3D9CC] rounded-xl focus:outline-none focus:border-[#C5924E] text-[#2D1F1A]"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Properties List Table / Cards */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E3D9CC] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E3D9CC] bg-[#F7F4EE]/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D1F1A]">Properties Database ({filteredProperties.length})</span>
          </div>
          <div className="divide-y divide-[#E3D9CC] overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#9E8B7F]">Loading properties...</div>
            ) : filteredProperties.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9E8B7F]">No properties found.</div>
            ) : (
              filteredProperties.map((prop) => (
                <div key={prop.id} className={`p-4 flex items-center justify-between hover:bg-[#F7F4EE]/40 transition-colors ${selectedProperty?.id === prop.id ? 'bg-[#F7F4EE]' : ''}`}>
                  <div className="flex items-center gap-3">
                    {prop.images?.[0] || prop.image_url ? (
                      <img src={prop.images?.[0] || prop.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#E3D9CC]" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#F7F4EE] border border-[#E3D9CC] flex items-center justify-center text-[#C5924E]">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-[#2D1F1A]">{prop.title || prop.name || "Untitled Property"}</h4>
                      <p className="text-[11px] text-[#9E8B7F] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {prop.location || prop.address || "Location not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                      prop.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      prop.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {prop.status || "Pending"}
                    </span>
                    <button
                      onClick={() => setSelectedProperty(prop)}
                      className="px-3 py-1.5 bg-[#2D1F1A] text-white text-xs font-semibold rounded-lg hover:bg-[#3A2E2A] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Item Inspector Panel */}
        <div className="bg-white rounded-2xl border border-[#E3D9CC] shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2D1F1A] uppercase tracking-wider border-b border-[#E3D9CC] pb-3 mb-4">Item Inspector</h3>
            {selectedProperty ? (
              <div className="space-y-4">
                {(selectedProperty.images?.[0] || selectedProperty.image_url) && (
                  <img src={selectedProperty.images?.[0] || selectedProperty.image_url} alt="" className="w-full h-36 object-cover rounded-xl border border-[#E3D9CC]" />
                )}
                <div>
                  <h4 className="text-base font-bold text-[#2D1F1A]">{selectedProperty.title || selectedProperty.name}</h4>
                  <p className="text-xs text-[#9E8B7F] mt-0.5 line-clamp-2">{selectedProperty.description || "No description provided."}</p>
                </div>
                <div className="p-3 bg-[#F7F4EE] border border-[#E3D9CC] rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9E8B7F]">Price / Rent:</span>
                    <span className="font-bold text-[#2D1F1A] flex items-center">
                      <IndianRupee className="w-3 h-3" /> {selectedProperty.price || selectedProperty.rent || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9E8B7F]">Owner Name:</span>
                    <span className="font-bold text-[#2D1F1A] flex items-center gap-1">
                      <User className="w-3 h-3 text-[#C5924E]" /> {selectedProperty.owner_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9E8B7F]">Owner Email:</span>
                    <span className="font-bold text-[#2D1F1A] truncate max-w-[150px]">
                      {selectedProperty.owner_email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9E8B7F]">Status:</span>
                    <span className="font-bold text-[#C5924E]">{selectedProperty.status || "Pending"}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => updatePropertyStatus(selectedProperty.id, "Active")}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Activate
                  </button>
                  <button
                    onClick={() => updatePropertyStatus(selectedProperty.id, "Rejected")}
                    className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#9E8B7F] text-center py-12">Select a property to inspect.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}