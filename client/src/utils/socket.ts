import { io, Socket } from 'socket.io-client';

class SocketWrapper {
  private socket: Socket | null = null;
  private token: string;
  public connected: boolean = false;

  constructor(token: string) {
    this.token = token;
  }

  connect() {
    if (this.socket) return;

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    console.log('Connecting Socket.IO client to:', API_BASE_URL);

    this.socket = io(API_BASE_URL, {
      auth: { token: this.token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected successfully!');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected.');
      this.connected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

let socketInstance: SocketWrapper | null = null;

export const getSocket = (token: string): any => {
  if (!socketInstance) {
    socketInstance = new SocketWrapper(token);
    socketInstance.connect();
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const getExistingSocket = (): any => {
  return socketInstance;
};
