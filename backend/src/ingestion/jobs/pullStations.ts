import { prisma } from "../../lib/prisma.js";
import { logger } from "../../lib/logger.js";
import { fetchStations } from "../tmdClient.js";
import { matchProvinceByName } from "../geoMatch.js";

export async function runPullStations() {
  const stations = await fetchStations();
  let matched = 0;
  let unmatched = 0;

  for (const s of stations) {
    const province = await matchProvinceByName(s.province);

    if (province) matched += 1;
    else unmatched += 1;

    await prisma.station.upsert({
      where: { tmdStationId: s.tmdStationId },
      create: {
        tmdStationId: s.tmdStationId,
        nameTh: s.nameTh,
        nameEn: s.nameEn,
        lat: s.lat,
        lng: s.lng,
        provinceId: province?.id,
      },
      update: {
        nameTh: s.nameTh,
        nameEn: s.nameEn,
        lat: s.lat,
        lng: s.lng,
        provinceId: province?.id,
      },
    });
  }

  logger.info({ total: stations.length, matched, unmatched }, "pullStations complete");
  return { total: stations.length, matched, unmatched };
}
