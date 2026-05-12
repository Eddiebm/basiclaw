"use client";

import type { Country } from "@/data/types";

type CountryRow = Pick<Country, "code" | "name" | "flag" | "region" | "legalSystem">;

export function CompareCountryPicker({
  id,
  label,
  countries,
  valueCode,
  excludeCode,
  disabled,
  onSelect,
}: {
  id: string;
  label: string;
  countries: CountryRow[];
  valueCode: string;
  excludeCode: string;
  disabled?: boolean;
  onSelect: (code: string) => void;
}) {
  const exclude = excludeCode.trim().toLowerCase();
  const options = countries.filter((c) => c.code.toLowerCase() !== exclude);
  const value = valueCode.trim().toLowerCase();

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </label>
      <select
        id={id}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        value={value}
        disabled={disabled}
        onChange={(e) => onSelect(e.target.value)}
      >
        {options.map((c) => (
          <option key={c.code} value={c.code.toLowerCase()}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
