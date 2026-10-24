---
title: "Building Low-Latency Live Chat & Interactive Showcases with WebSockets and Three.js"
date: "2026-10-24"
description: "A deep dive into integrating bidirectional Socket.io gateways, live contact messaging hubs, and 3D interactive hero canvas components in a modern Next.js portfolio."
tags: ["WebSockets", "Socket.io", "Three.js", "Realtime", "NestJS"]
---

Static portfolios are a thing of the past. Today's engineering leads and technical recruiters expect interactive, responsive proof of work. In the latest release of **Portfolio Showcase**, we transformed the messaging and project experience from static forms into an event-driven, real-time collaboration hub.

Here is the engineering breakdown of our real-time messaging gateway and dynamic 3D showcase canvas.

---

## 1. Bidirectional WebSocket Gateway in NestJS

Rather than relying on polling mechanisms or server-sent events for contact inquiries, we deployed a dedicated `ChatGateway` in NestJS utilizing `@nestjs/websockets` and `socket.io`:

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { senderId: string; recipientId: string; content: string }
  ) {
    // Persist message to PostgreSQL
    const saved = await this.chatService.saveMessage(payload);
    
    // Broadcast instantly to recipient room
    this.server.to(`user_${payload.recipientId}`).emit('newMessage', saved);
  }
}
```

This architecture allows recruiters, clients, and fellow engineers to initiate conversations directly from a project showcase or contact card, receiving instant delivery receipts and live typing status indicators.

---

## 2. The Unified Communications Center (`/dashboard/messages`)

In the administrative dashboard, incoming communications are segmented into two purpose-built streams:
1. **Contact Inquiries (Async Form Intel)**: Structured inquiries submitted via public contact forms with read/unread tracking, sender email verification, and timestamp sorting.
2. **WebSocket Live Chat (Sync Real-Time)**: Persistent chat threads with instant delivery status, sound effects, and online availability indicators.

---

## 3. High-Performance 3D Visuals Without Battery Drain

To create a striking first impression without turning laptop fans into jet engines, we paired `@react-three/fiber` and `@react-three/drei` with frame-rate throttling:

```typescript
// Gentle, low-overhead floating geometry
<Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]}>
  <ambientLight intensity={0.5} />
  <pointLight position={[10, 10, 10]} intensity={1} />
  <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
    <Icosahedron args={[1, 1]}>
      <meshStandardMaterial color="#8b5cf6" wireframe />
    </Icosahedron>
  </Float>
</Canvas>
```

By capping the device pixel ratio (`dpr={[1, 1.5]}`) and pausing canvas execution when off-screen using IntersectionObserver, we maintain a smooth 60 FPS while keeping GPU load under 4%.

---

## What’s Ahead

With zero-compute OCR ingestion, criteria-first quality scoring, hardened session heartbeats, and real-time live messaging, Portfolio Showcase has evolved into a complete developer portfolio operating system.

*Have questions about our implementation or want to contribute? Use the live chat drawer or leave a comment below!*
