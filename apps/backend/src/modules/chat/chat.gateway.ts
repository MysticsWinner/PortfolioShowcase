import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('system', { id: 'admin', message: 'A visitor connected to the matrix.' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() payload: { sender: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from ${payload.sender}: ${payload.message}`);
    // Broadcast the message globally to all connected clients
    this.server.emit('receiveMessage', {
      ...payload,
      id: client.id,
      timestamp: new Date().toISOString(),
    });
  }
}
