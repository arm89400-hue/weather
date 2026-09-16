import { prisma } from "../lib/prisma.js";

/**
 * Best-effort match of a TMD station's free-text province name to our seeded Province table.
 *
 * There's no reliable free per-district geocode source (see prisma/seed.ts), so stations are
 * only matched down to province level — districtId is left for manual curation later.
 */
export async function matchProvinceByName(name: string) {
  const cleaned = name.trim();
  if (!cleaned) return null;

  return prisma.province.findFirst({
    where: {
      OR: [
        { nameEn: { equals: cleaned, mode: "insensitive" } },
        { nameTh: { equals: cleaned } },
        { nameEn: { contains: cleaned, mode: "insensitive" } },
        { nameTh: { contains: cleaned } },
      ],
    },
  });
}
