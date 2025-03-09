import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    },
    path: '/socket' // Make sure the path is explicitly set
});

// Apply middleware before routes
app.use(express.json());
app.use(cors());

let entries = [];

// Ensure the correct route paths
app.post('/api/update-entries', (req, res) => {
    console.log('Received update request:', req.body);
    entries = req.body.entries;
    io.emit('entriesUpdated', entries); // Emit event to all connected clients
    res.status(200).send({ message: 'Entries updated successfully' });
});

app.delete('/api/delete/:id', (req, res) => {
    const id = req.params.id;
    console.log('Deleting entry with ID:', id);
    entries = entries.filter(entry => entry.id !== id);
    io.emit('entriesUpdated', entries); // Emit event to all connected clients
    res.status(200).send({ message: 'Entry deleted successfully' });
});

// Add a simple test route
app.get('/api/status', (req, res) => {
    res.status(200).send({ status: 'Server is running', entries: entries.length });
});

io.on('connection', (socket) => {
    console.log('New client connected with ID:', socket.id);
    socket.emit('entriesUpdated', entries); // Send current entries to new client
    
    // Debug incoming connections
    socket.on('handshake', (data) => {
        console.log('Client handshake received:', data);
        socket.emit('handshakeConfirmed', { status: 'connected' });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.NODE_SERVER_PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Socket.IO server is running on port ${PORT}`);
});