import { useState } from "react";
export const defaultSettings = {
  disableAnimations: false,
  actionSpeed: 5,
  bumpInterval: 1,
  likeInterval: 1,
  smartSpeed: true,
};
export type Settings = typeof defaultSettings;
export type Draft = {
  id: string;
  action: string;
  interval: number;
  createdAt: string;
};
export function useStored<T>(
  key: string,
  initial: T,
  valid: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      return valid(parsed) ? parsed : initial;
    } catch {
      return initial;
    }
  });
  const [error, setError] = useState("");
  function save(next: T) {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setError("");
    } catch {
      setError(
        "Browser storage is unavailable. Changes will last for this session only.",
      );
    }
  }
  return [value, save, error] as const;
}
export function isSettings(v: unknown): v is Settings {
  if (!v || typeof v !== "object") return false;
  const s = v as Settings;
  return (
    typeof s.disableAnimations === "boolean" &&
    typeof s.smartSpeed === "boolean" &&
    Number.isInteger(s.actionSpeed) &&
    s.actionSpeed >= 1 &&
    s.actionSpeed <= 120 &&
    [s.bumpInterval, s.likeInterval].every(
      (n) => Number.isInteger(n) && n >= 1 && n <= 24,
    )
  );
}
export function isDrafts(v: unknown): v is Draft[] {
  return (
    Array.isArray(v) &&
    v.every(
      (d) =>
        d &&
        typeof d.id === "string" &&
        typeof d.action === "string" &&
        Number.isInteger(d.interval) &&
        d.interval >= 1 &&
        d.interval <= 24 &&
        typeof d.createdAt === "string",
    )
  );
}
