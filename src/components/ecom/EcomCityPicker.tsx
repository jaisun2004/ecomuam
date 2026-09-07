import React, { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { citiesForState, geoCitiesFor, statesFor } from "@/lib/ecom-reference/geo";

interface Props {
  platform: string;
  value: string[];
  onChange: (cities: string[]) => void;
  /** cities with no stock for the chosen products — tagged, never blocked */
  outOfStock?: string[];
}

/** State first, then cities. Everything can be ticked and unticked. */
const EcomCityPicker: React.FC<Props> = ({ platform, value, onChange, outOfStock = [] }) => {
  const all = useMemo(() => geoCitiesFor(platform), [platform]);
  const states = useMemo(() => statesFor(platform), [platform]);
  const [pickedStates, setPickedStates] = useState<string[]>([]);

  const activeStates = pickedStates.length ? pickedStates : states;
  const cityOptions = all.filter((c) => activeStates.includes(c.state));

  const toggleState = (s: string) => {
    const on = pickedStates.includes(s);
    setPickedStates(on ? pickedStates.filter((x) => x !== s) : [...pickedStates, s]);
    const cities = citiesForState(platform, s);
    onChange(on ? value.filter((c) => !cities.includes(c)) : [...new Set([...value, ...cities])]);
  };

  const toggleCity = (c: string) =>
    onChange(value.includes(c) ? value.filter((x) => x !== c) : [...value, c]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <Picker
          label={states.some((s) => s === "Dubai" || s === "Abu Dhabi") ? "Emirate" : "State"}
          summary={pickedStates.length ? `${pickedStates.length} selected` : "All states"}
          placeholder="Search states…"
          empty="No state matches that."
        >
          {states.map((s) => (
            <CommandItem key={s} value={s} onSelect={() => toggleState(s)} className="text-xs">
              <Box on={pickedStates.includes(s)} />
              {s}
              <span className="ml-auto text-[10px] text-muted-foreground">{citiesForState(platform, s).length}</span>
            </CommandItem>
          ))}
        </Picker>

        <Picker
          label="City"
          summary={value.length ? `${value.length} selected` : "None yet"}
          placeholder="Search cities…"
          empty="No city matches that."
        >
          {cityOptions.map((c) => (
            <CommandItem key={c.platformCity} value={`${c.platformCity} ${c.geoCity}`} onSelect={() => toggleCity(c.platformCity)} className="text-xs">
              <Box on={value.includes(c.platformCity)} />
              <span className="truncate">
                {c.platformCity}
                {c.geoCity && c.geoCity.toLowerCase() !== c.platformCity.toLowerCase() && (
                  <span className="text-muted-foreground"> (platform name: {c.geoCity})</span>
                )}
              </span>
              {outOfStock.includes(c.platformCity) && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">out of stock</span>
              )}
            </CommandItem>
          ))}
          {cityOptions.length === 0 && <CommandItem disabled className="text-xs text-muted-foreground">No cities in the chosen states.</CommandItem>}
        </Picker>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {value.map((c) => (
            <span key={c} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-primary/10 text-primary border border-primary/30">
              {c}
              {outOfStock.includes(c) && <span className="text-[9px] text-muted-foreground">out of stock</span>}
              <button onClick={() => toggleCity(c)} aria-label={`Remove ${c}`} className="hover:text-foreground">
                <X size={10} />
              </button>
            </span>
          ))}
          <button onClick={() => { onChange([]); setPickedStates([]); }} className="text-[10px] text-muted-foreground hover:text-foreground underline">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

const Box: React.FC<{ on: boolean }> = ({ on }) => (
  <span className={`w-3.5 h-3.5 rounded border mr-2 flex items-center justify-center flex-shrink-0 ${on ? "bg-primary border-primary" : "border-border-visible"}`}>
    {on && <Check size={9} className="text-primary-foreground" />}
  </span>
);

const Picker: React.FC<{
  label: string;
  summary: string;
  placeholder: string;
  empty: string;
  children: React.ReactNode;
}> = ({ label, summary, placeholder, empty, children }) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</span>
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center gap-2 bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground hover:border-primary/40">
          <span className="flex-1 text-left truncate">{summary}</span>
          <ChevronDown size={13} className="text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-[300px] bg-surface-1 border-border-visible">
        <Command>
          <CommandInput placeholder={placeholder} className="text-xs" />
          <CommandList className="max-h-[260px]">
            <CommandEmpty className="py-4 text-xs text-muted-foreground text-center">{empty}</CommandEmpty>
            <CommandGroup>{children}</CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </label>
);

export default EcomCityPicker;
