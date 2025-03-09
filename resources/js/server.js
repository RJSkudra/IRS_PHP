import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors'; // Import the cors middleware

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"], // Allow specific methods
        allowedHeaders: ["Content-Type"], // Allow specific headers
        credentials: true // Allow credentials
    }
});

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

let entries = []; // Your entries data

app.post('/api/update-entries', (req, res) => {
    entries = req.body.entries;
    io.emit('entriesUpdated', entries); // Emit event to all connected clients
    res.status(200).send({ message: 'Entries updated successfully' });
});

app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    entries = entries.filter(entry => entry.id !== id);
    io.emit('entriesUpdated', entries); // Emit event to all connected clients
    res.status(200).send({ message: 'Entry deleted successfully' });
});

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.emit('entriesUpdated', entries); // Send current entries to new client

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(4000, () => {
    console.log('Server is running on port 4000');
});