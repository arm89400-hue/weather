import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");

type RawProvince = { id: number; name_th: string; name_en: string; geography_id: number };
type RawDistrict = { id: number; name_th: string; name_en: string; province_id: number };
type RawGeography = { id: number; name: string };
type GeocodedProvince = { id: number; lat: number | null; lng: number | null };

const REGION_EN: Record<string, string> = {
  ภาคเหนือ: "Northern",
  ภาคกลาง: "Central",
  ภาคตะวันออกเฉียงเหนือ: "Northeastern",
  ภาคตะวันตก: "Western",
  ภาคตะวันออก: "Eastern",
  ภาคใต้: "Southern",
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
}

async function main() {
  const rawProvinces = readJson<RawProvince[]>("provinces.raw.json");
  const rawDistricts = readJson<RawDistrict[]>("districts.raw.json");
  const geographies = readJson<RawGeography[]>("geographies.raw.json");
  const geocoded = readJson<GeocodedProvince[]>("provinces.geocoded.json");

  const geographyById = new Map(geographies.map((g) => [g.id, g.name]));
  const geocodeById = new Map(geocoded.map((g) => [g.id, g]));

  console.log(`Seeding ${rawProvinces.length} provinces...`);
  const provinceIdBySourceId = new Map<number, string>();

  for (const p of rawProvinces) {
    const geo = geocodeById.get(p.id);
    if (!geo?.lat || !geo?.lng) {
      console.warn(`No geocode for province ${p.name_en} (id ${p.id}), skipping`);
      continue;
    }

    const regionTh = geographyById.get(p.geography_id) ?? "";
    const province = await prisma.province.upsert({
      where: { sourceId: p.id },
      create: {
        sourceId: p.id,
        nameTh: p.name_th,
        nameEn: p.name_en,
        region: REGION_EN[regionTh] ?? regionTh,
        lat: geo.lat,
        lng: geo.lng,
      },
      update: {
        nameTh: p.name_th,
        nameEn: p.name_en,
        region: REGION_EN[regionTh] ?? regionTh,
        lat: geo.lat,
        lng: geo.lng,
      },
    });
    provinceIdBySourceId.set(p.id, province.id);
  }

  console.log(`Seeding ${rawDistricts.length} districts...`);
  let districtCount = 0;
  for (const d of rawDistricts) {
    const provinceId = provinceIdBySourceId.get(d.province_id);
    if (!provinceId) continue;

    await prisma.district.upsert({
      where: { sourceId: d.id },
      create: {
        sourceId: d.id,
        provinceId,
        nameTh: d.name_th,
        nameEn: d.name_en,
      },
      update: {
        provinceId,
        nameTh: d.name_th,
        nameEn: d.name_en,
      },
    });
    districtCount += 1;
  }

  console.log(`Seed complete: ${provinceIdBySourceId.size} provinces, ${districtCount} districts.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
