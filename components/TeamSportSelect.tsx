"use client";

import { useState } from "react";
import { sportIcon } from "@/lib/sports/icons";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Variant = { key: string; label: string; notes?: string };
type SportOption = { id: string; name: string; variants: Variant[] };

type Props = {
  sports: SportOption[];
  defaultSportId?: string;
  defaultVariantKey?: string | null;
};

export default function TeamSportSelect({ sports, defaultSportId = "", defaultVariantKey }: Props) {
  const [sportId, setSportId] = useState(defaultSportId);
  const [variantKey, setVariantKey] = useState(defaultVariantKey ?? "");
  const selectedSport = sports.find((s) => s.id === sportId);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label>Deporte</Label>
        <Select
          name="sport_id"
          required
          value={sportId}
          onValueChange={(value) => {
            setSportId(value ?? "");
            setVariantKey("");
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Elegí un deporte">
              {(value: string) => {
                const sport = sports.find((s) => s.id === value);
                return sport ? (
                  <span className="flex items-center gap-2">
                    {sportIcon(sport.name, "h-4 w-4")}
                    {sport.name}
                  </span>
                ) : (
                  "Elegí un deporte"
                );
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sports.map((sport) => (
              <SelectItem key={sport.id} value={sport.id}>
                {sportIcon(sport.name, "h-4 w-4")}
                {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSport && selectedSport.variants.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Variante/formato</Label>
          <Select
            name="variant_key"
            value={variantKey}
            onValueChange={(value) => setVariantKey(value ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sin variante específica">
                {(value: string) =>
                  selectedSport.variants.find((v) => v.key === value)?.label ??
                  "Sin variante específica"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin variante específica</SelectItem>
              {selectedSport.variants.map((variant) => (
                <SelectItem key={variant.key} value={variant.key}>
                  {variant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
