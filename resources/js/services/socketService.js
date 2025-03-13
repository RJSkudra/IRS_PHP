import io from 'socket.io-client';

class SocketService {
  constructor(eventHandler) {
    this.socket = null;
    this.isConnected = false;
    this.eventHandler = eventHandler;
    this.setupSocket();
  }

  setupSocket() {
    const isSecure = window.location.protocol === 'https:';
    const HOST_DOMAIN = isSecure
      ? `https://${window.location.hostname}`
      : `http://${window.location.hostname}`;
    const SOCKET_URL =
      window.location.hostname === 'localhost'
        ? `http://${window.location.hostname}:4000`
        : HOST_DOMAIN;

    console.log('Connecting to Socket.IO server:', SOCKET_URL, 'with path:', '/socket.io');

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true,
      secure: isSecure,
      rejectUnauthorized: false,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server with ID:', this.socket.id);
      console.log('Transport type:', this.socket.io.engine.transport.name);
      this.socket.emit('handshake', { client: 'web', time: new Date().toISOString() });
      this.isConnected = true;
      
      if (this.eventHandler && this.eventHandler.onConnect) {
        this.eventHandler.onConnect(this.socket);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      this.isConnected = false;
      
      if (this.eventHandler && this.eventHandler.onDisconnect) {
        this.eventHandler.onDisconnect(reason);
      }
    });

    this.socket.on('entriesUpdated', (updatedEntries) => {
      if (this.eventHandler && this.eventHandler.onEntriesUpdated) {
        this.eventHandler.onEntriesUpdated(updatedEntries);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      transport: this.socket?.io.engine.transport?.name
    };
  }
}

export default SocketService;