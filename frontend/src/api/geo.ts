import { apiClient } from "./client";

export type Province = {
  id: string;
  nameTh: string;
  nameEn: string;
  region: string;
  lat: number;
  lng: number;
};

export type District = {
  id: string;
  nameTh: string;
  nameEn: string;
  lat: number | null;
  lng: number | null;
};

export async function fetchProvinces() {
  const res = await apiClient.get<Province[]>("/geo/provinces");
  return res.data;
}

export async function fetchDistricts(provinceId: string) {
  const res = await apiClient.get<District[]>(`/geo/provinces/${provinceId}/districts`);
  return res.data;
}

export async function fetchNearestLocation(lat: number, lng: number) {
  const res = await apiClient.get<{ province: Province; district: District | null }>("/geo/nearest", {
    params: { lat, lng },
  });
  return res.data;
}
