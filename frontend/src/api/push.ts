import { apiClient } from "./client";

export async function fetchVapidPublicKey() {
  const res = await apiClient.get<{ publicKey: string }>("/push/vapid-public-key");
  return res.data.publicKey;
}

export async function subscribePush(subscription: PushSubscriptionJSON) {
  await apiClient.post("/push/subscribe", subscription);
}

export async function unsubscribePush(endpoint: string) {
  await apiClient.delete("/push/subscribe", { data: { endpoint } });
}
