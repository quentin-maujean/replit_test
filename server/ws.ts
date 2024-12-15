import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from "http";
import type { Express } from "express";
import { db } from "@db";
import { notifications } from "@db/schema";
import { eq } from "drizzle-orm";

const clients = new Map<number, WebSocket>();

export function setupWebSocket(server: Server, app: Express) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    // Skip vite HMR requests
    const protocol = request.headers['sec-websocket-protocol'];
    if (protocol === 'vite-hmr') {
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on("connection", (ws, req) => {
    const userId = req.url?.split("=")[1];
    if (!userId) {
      ws.close();
      return;
    }

    clients.set(parseInt(userId), ws);

    ws.on("close", () => {
      clients.delete(parseInt(userId));
    });
  });
}

export async function sendNotification(userId: number, type: string, message: string) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      type,
      message,
    })
    .returning();

  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(notification));
  }
}

export async function markNotificationAsRead(notificationId: number) {
  return db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId))
    .returning();
}
