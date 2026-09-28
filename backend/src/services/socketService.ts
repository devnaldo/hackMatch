import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class SocketService {
  private static io: SocketIOServer | null = null;

  static init(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      path: '/socket.io',
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`WebSocket client connected: ${socket.id}`);

      socket.on('join_room', (data: { userId: string }) => {
        if (data?.userId) {
          socket.join(`user_${data.userId}`);
          console.log(`Socket ${socket.id} joined user room: user_${data.userId}`);
        }
      });

      socket.on('join_team', (data: { teamId: string }) => {
        if (data?.teamId) {
          socket.join(`team_${data.teamId}`);
          console.log(`Socket ${socket.id} joined team room: team_${data.teamId}`);
        }
      });

      socket.on('leave_team', (data: { teamId: string }) => {
        if (data?.teamId) {
          socket.leave(`team_${data.teamId}`);
          console.log(`Socket ${socket.id} left team room: team_${data.teamId}`);
        }
      });

      socket.on('user_typing', (data: { teamId: string; isTyping: boolean; userName: string }) => {
        if (data?.teamId) {
          socket.to(`team_${data.teamId}`).emit('typing_indicator', data);
        }
      });

      socket.on('disconnect', () => {
        console.log(`WebSocket client disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  static sendNotificationToUser(userId: string, notification: any) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('receive_notification', notification);
    }
  }

  static sendMessageToTeam(teamId: string, message: any) {
    if (this.io) {
      this.io.to(`team_${teamId}`).emit('receive_message', message);
    }
  }

  static sendBadgeUpdate(userId: string) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('badge_update', { userId });
    }
  }
}
