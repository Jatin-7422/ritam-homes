import React, { useState, useEffect, useRef } from "react";

export default function AddressAutocomplete({ value, onChange, onSelect }) {
  const [addressSearch, setAddressSearch] = useState(value || "");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            addressSearch,
          )}&apiKey=${GEOAPIFY_API_KEY}&limit=5`,
        );
        const data = await response.json();
        if (data.features) {
          setAddressSuggestions(data.features);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching Geoapify suggestions:", error);
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

  return (
    <div className="relative w-full" ref={searchWrapperRef}>
      <input
        type="text"
        placeholder="Search your address or locality"
        value={addressSearch}
        onChange={handleChange}
        className="w-full px-3 py-2.5 rounded-xl border border-[#E3D9CC] bg-[#F8F5EE] text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E]"
      />

      {showSuggestions && addressSuggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E3D9CC] rounded-xl shadow-lg max-h-48 overflow-y-auto z-20">
          {addressSuggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              className="px-3 py-2 text-xs text-[#2D1F1A] hover:bg-[#F8F5EE] cursor-pointer border-b border-[#E3D9CC] last:border-b-0"
            >
              {item.properties.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
