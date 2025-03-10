import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Get environment variables or use defaults
const HOST_DOMAIN = process.env.APP_URL || 
                   process.env.SOCKET_URL || 
                   'http://localhost:4000';  // Default to HTTP for development
const PORT = process.env.NODE_SERVER_PORT || 4000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Add this helper function to determine protocol from HOST_DOMAIN
const isSecureConnection = HOST_DOMAIN.startsWith('https:');

console.log(`Starting server with HOST_DOMAIN: ${HOST_DOMAIN} (${isSecureConnection ? 'secure' : 'non-secure'})`);

// Create Socket.IO server with comprehensive CORS configuration
const io = new Server(server, {
    cors: {
        origin: '*', // In production, set to specific domains
        methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-CSRF-TOKEN"],
        credentials: true
    },
    path: '/socket.io',
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['polling', 'websocket'], // Try polling first for better compatibility
    allowEIO3: true,
    connectTimeout: 45000,
    maxHttpBufferSize: 1e8,
    allowUpgrades: true,
    perMessageDeflate: {
        threshold: 1024
    }
});

// Apply middleware
app.use(express.json());

// Configure CORS with specific headers needed for WebSocket
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "X-CSRF-TOKEN"],
    exposedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true
}));

// Special middleware for OPTIONS requests (WebSocket preflight)
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-CSRF-TOKEN');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.status(200).end();
    }
    return next();
});

// Enhanced request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} from ${req.ip}`);
    
    // Log important headers for debugging
    const importantHeaders = ['origin', 'host', 'x-real-ip', 'x-forwarded-for', 'x-forwarded-proto', 'connection', 'upgrade'];
    const headersToLog = {};
    importantHeaders.forEach(header => {
        if (req.headers[header]) {
            headersToLog[header] = req.headers[header];
        }
    });
    
    if (Object.keys(headersToLog).length > 0) {
        console.log('Important headers:', headersToLog);
    }
    
    next();
});

// In-memory storage for entries
let entries = [];

// API Routes
app.post('/api/update-entries', (req, res) => {
    try {
        console.log('Received update request:', req.body);
        if (!req.body.entries || !Array.isArray(req.body.entries)) {
            return res.status(400).send({ error: 'Invalid entries data' });
        }
        entries = req.body.entries;
        io.emit('entriesUpdated', entries);
        res.status(200).send({ message: 'Entries updated successfully' });
    } catch (error) {
        console.error('Error updating entries:', error);
        res.status(500).send({ error: 'Failed to update entries' });
    }
});

app.delete('/api/delete/:id', (req, res) => {
    try {
        const id = req.params.id;
        console.log('Deleting entry with ID:', id);
        const initialLength = entries.length;
        entries = entries.filter(entry => entry.id !== id);
        
        if (entries.length === initialLength) {
            return res.status(404).send({ error: 'Entry not found' });
        }
        
        io.emit('entriesUpdated', entries);
        res.status(200).send({ message: 'Entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).send({ error: 'Failed to delete entry' });
    }
});

// Get all entries
app.get('/api/entries', (req, res) => {
    res.status(200).send(entries);
});

// Enhanced health check endpoint for better monitoring
app.get('/health', (req, res) => {
    res.status(200).send({ 
        status: 'healthy', 
        uptime: process.uptime(),
        connections: io.engine.clientsCount,
        connectionMode: io.engine.transports,
        timestamp: new Date().toISOString(),
        message: 'Socket.IO server is running normally'
    });
});

// Status endpoint
app.get('/api/status', (req, res) => {
    res.status(200).send({ 
        status: 'Server is running', 
        entries: entries.length,
        connections: io.engine.clientsCount,
        path: io.path()
    });
});

// Add this route for testing connectivity
app.get('/socket-diagnostic', (req, res) => {
    res.status(200).send({
        server: 'online',
        socketIoPath: io.path(),
        transports: io.engine.transports,
        connections: io.engine.clientsCount,
        corsConfig: io.engine.opts.cors,
        serverTime: new Date().toISOString(),
        requestHeaders: req.headers
    });
});

// Socket.IO connection handler with comprehensive logging
io.on('connection', (socket) => {
    console.log(`New client connected with ID: ${socket.id}`);
    console.log(`Transport type: ${socket.conn.transport.name}`);
    console.log(`Client IP: ${socket.handshake.address}`);
    console.log(`Headers: ${JSON.stringify(socket.handshake.headers)}`);
    
    // Send current entries to the new client
    socket.emit('entriesUpdated', entries);
    
    // Handle handshake events
    socket.on('handshake', (data) => {
        console.log('Client handshake received:', data);
        socket.emit('handshakeConfirmed', { 
            status: 'connected',
            socketId: socket.id,
            serverTime: new Date().toISOString(),
            transport: socket.conn.transport.name
        });
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    // Handle disconnects
    socket.on('disconnect', (reason) => {
        console.log(`Client disconnected (${reason}): ${socket.id}`);
    });
});

// Special route for WebSocket testing
app.get('/socket-test', (req, res) => {
    // Determine if we're using HTTPS from the request
    const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https';
    
    res.send(`
        <html>
            <head>
                <title>Socket.IO Test</title>
                <script src="https://cdn.socket.io/4.4.1/socket.io.min.js"></script>
                <script>
                    document.addEventListener('DOMContentLoaded', () => {
                        document.getElementById('status').textContent = 'Attempting connection...';
                        
                        const socketUrl = '${HOST_DOMAIN}';
                        console.log('Connecting to Socket.IO at:', socketUrl);
                        
                        // More robust connection options
                        const socket = io(socketUrl, {
                            path: '/socket.io',
                            transports: ['polling', 'websocket'], // Try polling first
                            reconnectionAttempts: 5,
                            reconnectionDelay: 1000,
                            timeout: 20000,
                            forceNew: true,
                            secure: ${isSecure}, // Set based on protocol
                            rejectUnauthorized: false // For development only
                        });
                        
                        socket.on('connect', () => {
                            document.getElementById('status').textContent = 'Connected to Socket.IO server';
                            document.getElementById('transport').textContent = socket.io.engine.transport.name;
                            document.getElementById('id').textContent = socket.id;
                            console.log('Connected with transport:', socket.io.engine.transport.name);
                        });
                        
                        socket.on('connect_error', (error) => {
                            console.error('Connection error:', error);
                            document.getElementById('status').textContent = 'Connection error: ' + error;
                        });
                        
                        socket.on('reconnect_attempt', (attempt) => {
                            console.log('Reconnection attempt:', attempt);
                            document.getElementById('status').textContent = 'Reconnection attempt: ' + attempt;
                        });
                        
                        socket.on('entriesUpdated', (data) => {
                            document.getElementById('entries').textContent = 
                                'Received ' + data.length + ' entries';
                        });
                    });
                </script>
            </head>
            <body>
                <h1>Socket.IO Test Page</h1>
                <div>Status: <span id="status">Connecting...</span></div>
                <div>Transport: <span id="transport">-</span></div>
                <div>Socket ID: <span id="id">-</span></div>
                <div>Data: <span id="entries">-</span></div>
                <div><button onclick="location.reload()">Reconnect</button></div>
            </body>
        </html>
    `);
});

// Handle server-level errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

// Start the server
server.listen(PORT, HOST, () => {
    console.log(`Socket.IO server is running on port ${PORT}`);
    console.log(`Health check available at http://${HOST}:${PORT}/health`);
    console.log(`Socket test page available at http://${HOST}:${PORT}/socket-test`);
    console.log(`Socket.IO path is configured as: ${io.path()}`);
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
});