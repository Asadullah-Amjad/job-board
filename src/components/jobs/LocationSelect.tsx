import { GULF_LOCATIONS, gulfLocationValue } from "@/lib/locations/gulf";

export default function LocationSelect({ name = "locationRegion", defaultValue = "", className = "w-full bg-transparent text-sm outline-none" }: { name?: string; defaultValue?: string; className?: string }) {
  const knownValues = GULF_LOCATIONS.flatMap((group) => group.regions.map((region) => gulfLocationValue(region, group.country)));
  return (
    <select name={name} defaultValue={defaultValue} className={className}>
      {defaultValue && !knownValues.includes(defaultValue) && <option value={defaultValue}>{defaultValue}</option>}
      <option value="">All Gulf countries and regions</option>
      {GULF_LOCATIONS.map((group) => (
        <optgroup key={group.country} label={`${group.flag} ${group.country}`}>
          <option value={group.country}>{group.flag} All {group.country}</option>
          {group.regions.map((region) => (
            <option key={`${group.country}-${region}`} value={gulfLocationValue(region, group.country)}>
              {group.flag} {region}, {group.country}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
