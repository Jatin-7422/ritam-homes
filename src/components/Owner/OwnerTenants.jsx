import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../../supabaseClient";
import { AppContext } from "../../App";
import {
  Users,
  Mail,
  Phone,
  Building,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function OwnerTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { preferences } = useContext(AppContext);
  const isDarkTheme =
    preferences.theme === "Dark Mode" || preferences.theme === "Dark";

useEffect(() => {
    const fetchOwnerTenants = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) return;
        const ownerId = session.user.id;

        // 1. Get properties owned by this user
        const { data: properties, error: propError } = await supabase
          .from("properties")
          .select("id, title")
          .eq("owner_id", ownerId);

        if (propError) throw propError;
        if (!properties || properties.length === 0) {
          setLoading(false);
          return;
        }

        const propertyIds = properties.map((p) => p.id);
        const propertyMap = properties.reduce((acc, p) => {
          acc[p.id] = p.title;
          return acc;
        }, {});

        // 2. Fetch confirmed visit slots for these properties
        const { data: bookings, error: bookingError } = await supabase
          .from("property_visit_slots")
          .select("*")
          .in("property_id", propertyIds)
          .eq("status", "confirmed");

        if (bookingError) throw bookingError;
        if (!bookings || bookings.length === 0) {
          setLoading(false);
          setTenants([]);
          return;
        }

        const tenantIds = [...new Set(bookings.map((b) => b.tenant_id).filter(Boolean))];

        // 3. Fetch names from tenant_documents where available
        let tenantNameMap = {};
        if (tenantIds.length > 0) {
          const { data: docData } = await supabase
            .from("tenant_documents")
            .select("tenant_id, tenant_name")
            .in("tenant_id", tenantIds);

          if (docData) {
            docData.forEach((doc) => {
              if (doc.tenant_id && doc.tenant_name) {
                tenantNameMap[doc.tenant_id] = doc.tenant_name;
              }
            });
          }
        }

        // 4. Format final list with names from documents or clean fallback IDs
        const formattedTenants = bookings.map((b) => {
          const resolvedName = tenantNameMap[b.tenant_id] || `Tenant (${b.tenant_id ? b.tenant_id.slice(0, 6) : "Unknown"})`;

          return {
            id: b.id,
            name: resolvedName,
            email: "Verified Resident",
            phone: "Available in Records",
            propertyTitle: propertyMap[b.property_id] || "Assigned Property",
            status: b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : "Confirmed",
          };
        });

        setTenants(formattedTenants);
      } catch (err) {
        console.error("Error fetching tenants:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerTenants();
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3D9CC]/30">
        <div>
          <h1
            className={`text-2xl font-serif font-bold ${isDarkTheme ? "text-white" : "text-[#2D1F1A]"}`}
          >
            My Property Tenants
          </h1>
          <p
            className={`text-xs mt-1 ${isDarkTheme ? "text-[#9E8B7F]" : "text-[#6E5D53]"}`}
          >
            Manage and view details of tenants currently renting your
            properties.
          </p>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5924E]" />
        </div>
      ) : tenants.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border ${isDarkTheme ? "bg-[#221A17] border-neutral-800" : "bg-white border-[#E3D9CC]"} shadow-sm`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#C5924E]/10 text-[#C5924E] flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3
            className={`font-serif font-bold text-base ${isDarkTheme ? "text-white" : "text-[#2D1F1A]"}`}
          >
            No tenants found
          </h3>
          <p
            className={`text-xs mt-1 max-w-sm mx-auto ${isDarkTheme ? "text-[#9E8B7F]" : "text-[#6E5D53]"}`}
          >
            You don't have any active tenant bookings or leases registered for
            your properties yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className={`p-6 rounded-2xl border transition-all shadow-sm flex flex-col justify-between ${
                isDarkTheme
                  ? "bg-[#221A17] border-neutral-800 text-white"
                  : "bg-white border-[#E3D9CC] text-[#2D1F1A]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C5924E]/20 text-[#C5924E] font-bold flex items-center justify-center text-sm">
                      {tenant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{tenant.name}</h4>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md mt-0.5">
                        <ShieldCheck className="w-3 h-3" /> {tenant.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-neutral-500/10">
                  <div className="flex items-center gap-2 opacity-80">
                    <Building className="w-3.5 h-3.5 text-[#C5924E]" />
                    <span className="truncate">
                      Property:{" "}
                      <strong className="font-medium">
                        {tenant.propertyTitle}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 opacity-80">
                    <Mail className="w-3.5 h-3.5 text-[#C5924E]" />
                    <span className="truncate">{tenant.email}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-80">
                    <Phone className="w-3.5 h-3.5 text-[#C5924E]" />
                    <span>{tenant.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
