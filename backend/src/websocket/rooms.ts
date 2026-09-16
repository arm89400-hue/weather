import type { Socket } from "socket.io";

export function registerRoomHandlers(socket: Socket) {
  socket.on("subscribe:province", (provinceId: string) => {
    socket.join(`province:${provinceId}`);
  });

  socket.on("unsubscribe:province", (provinceId: string) => {
    socket.leave(`province:${provinceId}`);
  });
}
