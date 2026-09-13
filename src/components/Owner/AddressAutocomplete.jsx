import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, MapPin } from "lucide-react";

export default function AddressAutocomplete({ value, onChange, onSelect }) {
  const [addressSearch, setAddressSearch] = useState(value || "");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const searchWrapperRef = useRef(null);
  const GEOAPIFY_API_KEY = "9808de77fb394b4789d345848d5c3f2e";

  useEffect(() => {
    setAddressSearch(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!addressSearch || addressSearch.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            addressSearch
          )}&apiKey=${GEOAPIFY_API_KEY}&limit=5`
        );
        const data = await response.json();
        if (data.features) {
          setAddressSuggestions(data.features);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching Geoapify suggestions:", error);
      } finally {
        setIsGeocoding(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [addressSearch]);

  const handleChange = (e) => {
    const val = e.target.value;
    setAddressSearch(val);
    if (onChange) onChange(val);
  };

  const handleSelect = (feature) => {
    const formattedAddress = feature.properties.formatted;
    const lat = feature.properties.lat;
    const lon = feature.properties.lon;

    setAddressSearch(formattedAddress);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(formattedAddress, lat, lon);
    }
  };

  const handleClear = () => {
    setAddressSearch("");
    setAddressSuggestions([]);
    setShowSuggestions(false);
    if (onChange) onChange("");
    if (onSelect) onSelect("", null, null);
  };

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`
          );
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            const formattedAddress = data.features[0].properties.formatted;
            setAddressSearch(formattedAddress);
            setShowSuggestions(false);
            if (onChange) onChange(formattedAddress);
            if (onSelect) onSelect(formattedAddress, lat, lon);
          } else {
            if (onSelect) onSelect("Current Location", lat, lon);
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          if (onSelect) onSelect("Current Location", lat, lon);
        } finally {
          setIsGeocoding(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please check permissions.");
        setIsGeocoding(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative w-full space-y-2" ref={searchWrapperRef}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 w-4 h-4 text-[#C5924E]" />
        <input
          type="text"
          placeholder="Search your address or locality"
          value={addressSearch}
          onChange={handleChange}
          onFocus={() => {
            if (addressSuggestions.length > 0) setShowSuggestions(true);
          }}
          className="w-full pl-9 pr-16 py-3 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs sm:text-sm text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] shadow-2xs"
        />
        
        <div className="absolute right-3 flex items-center gap-1.5">
          {isGeocoding && (
            <Loader2 className="w-4 h-4 animate-spin text-[#C5924E]" />
          )}
          {!isGeocoding && addressSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-[#2D1F1A] rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDetectCurrentLocation}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#C5924E]/10 hover:bg-[#C5924E]/20 border border-[#C5924E]/40 rounded-xl text-xs font-bold text-[#2D1F1A] transition-all cursor-pointer shadow-2xs"
      >
        <MapPin className="w-3.5 h-3.5 text-[#C5924E]" />
        Use my current GPS location
      </button>

      {showSuggestions && addressSuggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E3D9CC] rounded-xl shadow-xl max-h-52 overflow-y-auto z-50">
          {addressSuggestions.map((item, idx) => (
            <li
              key={idx}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item)}
              className="px-3.5 py-3 text-xs text-[#2D1F1A] hover:bg-[#F8F5EE] cursor-pointer border-b border-[#E3D9CC]/60 last:border-b-0 flex items-start gap-2.5"
            >
              <MapPin className="w-4 h-4 text-[#C5924E] flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item.properties.formatted}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}