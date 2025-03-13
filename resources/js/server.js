import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const isProduction = process.env.NODE_ENV === 'production';
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
        origin: isProduction 
            ? [process.env.APP_URL].filter(Boolean) 
            : ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:4000'],
        methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-CSRF-TOKEN", "X-Requested-With"],
        credentials: true
    },
    path: '/socket.io', // CHANGED from '/socket-api' to '/socket.io'
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

// Make sure the API_PREFIX is determined correctly:

// Different API path for development vs production

const API_PREFIX = isProduction ? '/api' : '/socket.io'; // CHANGED from '/socket-api'

console.log(`Using API prefix: ${API_PREFIX} based on environment: ${process.env.NODE_ENV || 'development'}`);

// Apply middleware
app.use(express.json());

// Configure CORS with specific headers needed for WebSocket
app.use(cors({
    origin: isProduction 
        ? [process.env.APP_URL].filter(Boolean) 
        : ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:4000'],
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-TOKEN", "X-Requested-With"],
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

// API Routes - Use the dynamic API_PREFIX
app.post(`${API_PREFIX}/update-entries`, handleUpdateEntries);
app.post('/socket.io/update-entries', handleUpdateEntries);

// Extract the handler to a separate function to avoid duplication
function handleUpdateEntries(req, res) {
    try {
        console.log('Received update request via:', req.path);
        console.log('Request body:', req.body);

        if (!req.body.entries || !Array.isArray(req.body.entries)) {
            console.error('Invalid entries data:', req.body);
            return res.status(400).send({ error: 'Invalid entries data' });
        }

        entries = req.body.entries;
        console.log(`Broadcasting ${entries.length} entries to ${io.engine.clientsCount} connected clients`);
        io.emit('entriesUpdated', entries);
        res.status(200).send({ message: 'Entries updated successfully' });
    } catch (error) {
        console.error('Error updating entries:', error);
        res.status(500).send({ error: 'Failed to update entries' });
    }
}

// Add this if it doesn't exist
app.post('/socket.io/update-entries', handleUpdateEntries);

// Update other API routes to use the dynamic prefix
app.delete(`${API_PREFIX}/delete/:id`, (req, res) => {
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
app.get(`${API_PREFIX}/entries`, (req, res) => {
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
app.get(`${API_PREFIX}/status`, (req, res) => {
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

// Ensure we handle both API prefixes correctly
if (!isProduction) {
    // In development, also handle the socket-api prefix explicitly
    app.post('/socket-api/update-entries', (req, res) => {
        try {
            console.log('Received update request on socket-api path:', req.body);
            
            // Check for CSRF token in header
            const csrfHeader = req.headers['x-csrf-token'];
            
            if (!csrfHeader) {
                console.warn('Missing CSRF token in request');
            } else {
                console.log('CSRF token present:', csrfHeader);
            }
            
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
    
    // Also handle other endpoints with the socket-api prefix
    app.get('/socket-api/entries', (req, res) => {
        res.status(200).send(entries);
    });
    
    app.delete('/socket-api/delete/:id', (req, res) => {
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

    // Redirect from /socket-api to /socket.io
    app.use('/socket-api', (req, res, next) => {
        console.log(`Redirecting legacy request from /socket-api to /socket.io`);
        req.url = '/socket.io' + req.url.substring('/socket-api'.length);
        next();
    });
}

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

    // Handle storeEntry event
    socket.on('storeEntry', (formData, callback) => {
        try {
            // Validate the form data (you can add more validation as needed)
            if (!formData.name || !formData.surname || !formData.age || !formData.phone || !formData.address) {
                return callback({ success: false, message: 'Invalid form data' });
            }

            // Create a new entry (assuming you have a function to handle this)
            const newEntry = { ...formData, id: entries.length + 1 };
            entries.push(newEntry);

            // Broadcast the updated entries to all connected clients
            io.emit('entriesUpdated', entries);

            // Send success response
            callback({ success: true, message: 'Entry created successfully' });
        } catch (error) {
            console.error('Error storing entry:', error);
            callback({ success: false, message: 'Failed to store entry' });
        }
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

// Handle server-level errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

// Start the server
server.listen(PORT, HOST, () => {
    console.log(`Socket.IO server is running on port ${PORT}`);
    console.log(`Health check available at http://${HOST}:${PORT}/health`);
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