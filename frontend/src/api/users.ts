import { apiClient } from "./client";
import type { AuthUser } from "./auth";

export async function fetchMe() {
  const res = await apiClient.get<AuthUser>("/users/me");
  return res.data;
}

export async function updateFavoriteProvince(favoriteProvinceId: string | null) {
  const res = await apiClient.patch<AuthUser>("/users/me", { favoriteProvinceId });
  return res.data;
}
