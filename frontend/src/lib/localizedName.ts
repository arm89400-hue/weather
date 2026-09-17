import type { Language } from "../context/SettingsContext";

type Named = { nameEn: string; nameTh: string };

/** Provinces/districts already carry both names from the DB (see backend/prisma/schema.prisma) —
 * this just picks the right one instead of leaving Thai-language mode with English place names. */
export function localizedName(entity: Named | null | undefined, language: Language): string {
  if (!entity) return "";
  return language === "th" ? entity.nameTh : entity.nameEn;
}
