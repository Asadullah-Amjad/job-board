export interface GulfLocationGroup {
  country: string;
  flag: string;
  regions: string[];
}

export const GULF_LOCATIONS: GulfLocationGroup[] = [
  {
    country: "United Arab Emirates",
    flag: "🇦🇪",
    regions: ["Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al Quwain"],
  },
  {
    country: "Saudi Arabia",
    flag: "🇸🇦",
    regions: ["Asir", "Eastern Province", "Jazan", "Makkah", "Madinah", "Najran", "Northern Borders", "Qassim", "Riyadh", "Tabuk"],
  },
  {
    country: "Qatar",
    flag: "🇶🇦",
    regions: ["Al Daayen", "Al Khor", "Al Rayyan", "Al Shamal", "Al Wakrah", "Doha", "Umm Salal"],
  },
  {
    country: "Kuwait",
    flag: "🇰🇼",
    regions: ["Al Ahmadi", "Al Asimah", "Al Farwaniyah", "Al Jahra", "Hawalli", "Mubarak Al-Kabeer"],
  },
  {
    country: "Bahrain",
    flag: "🇧🇭",
    regions: ["Capital", "Central", "Muharraq", "Northern", "Southern"],
  },
  {
    country: "Oman",
    flag: "🇴🇲",
    regions: ["Ad Dakhiliyah", "Al Batinah North", "Al Batinah South", "Al Buraimi", "Al Wusta", "Dhofar", "Musandam", "Muscat", "North Ash Sharqiyah", "South Ash Sharqiyah"],
  },
];

export function gulfLocationValue(region: string, country: string) {
  return `${region}, ${country}`;
}
