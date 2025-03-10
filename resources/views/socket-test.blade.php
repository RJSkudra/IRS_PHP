<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Connection Test</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://cdn.socket.io/4.4.1/socket.io.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-good {
            color: green;
            font-weight: bold;
        }
        .status-bad {
            color: red;
            font-weight: bold;
        }
        button {
            padding: 8px 16px;
            background: #4a6cf7;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 10px 0;
        }
        pre {
            background: #f5f5f5;
            padding: 10px;
            overflow-x: auto;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <h1>WebSocket Connection Test</h1>
    
    <div class="card">
        <h2>Connection Status</h2>
        <p>Status: <span id="status" class="status-bad">Disconnected</span></p>
        <p>Socket ID: <span id="socketId">-</span></p>
        <p>Transport: <span id="transport">-</span></p>
        <button id="connectBtn">Connect</button>
        <button id="disconnectBtn">Disconnect</button>
    </div>
    
    <div class="card">
        <h2>Handshake</h2>
        <button id="handshakeBtn">Send Handshake</button>
        <p>Response: <span id="handshakeResponse">-</span></p>
    </div>
    
    <div class="card">
        <h2>Entries</h2>
        <p>Count: <span id="entryCount">0</span></p>
        <pre id="entries">[]</pre>
    </div>
    
    <div class="card">
        <h2>Debug Information</h2>
        <p>Server URL: <span id="serverUrl">{{ env('SOCKET_SERVER_URL') }}</span></p>
        <p>Browser: <span id="browser">{{ request()->header('User-Agent') }}</span></p>
        <p>Debug Console: <span id="consoleOutput"></span></p>
    </div>

    <script>
        // Get elements
        const statusEl = document.getElementById('status');
        const socketIdEl = document.getElementById('socketId');
        const transportEl = document.getElementById('transport');
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        const handshakeBtn = document.getElementById('handshakeBtn');
        const handshakeResponseEl = document.getElementById('handshakeResponse');
        const entryCountEl = document.getElementById('entryCount');
        const entriesEl = document.getElementById('entries');
        const consoleOutputEl = document.getElementById('consoleOutput');
        
        // Socket.IO URL
        const SOCKET_URL = "{{ env('SOCKET_SERVER_URL') }}";
        
        // Initialize socket as null
        let socket = null;
        
        // Helper function to log to page
        function logToPage(message) {
            consoleOutputEl.textContent = message;
        }
        
        // Connect to Socket.IO
        function connect() {
            if (socket) {
                logToPage('Socket already exists, disconnecting first...');
                socket.disconnect();
            }
            
            logToPage('Connecting to: ' + SOCKET_URL);
            
            // Create socket connection
            socket = io(SOCKET_URL, {
                path: '/socket.io',
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5,
                timeout: 10000
            });
            
            // Connection events
            socket.on('connect', () => {
                statusEl.textContent = 'Connected';
                statusEl.className = 'status-good';
                socketIdEl.textContent = socket.id;
                transportEl.textContent = socket.io.engine.transport.name;
                logToPage('Connected successfully');
            });
            
            socket.on('connect_error', (error) => {
                statusEl.textContent = 'Error: ' + error.message;
                statusEl.className = 'status-bad';
                logToPage('Connection error: ' + error.message);
            });
            
            socket.on('disconnect', (reason) => {
                statusEl.textContent = 'Disconnected: ' + reason;
                statusEl.className = 'status-bad';
                socketIdEl.textContent = '-';
                transportEl.textContent = '-';
                logToPage('Disconnected: ' + reason);
            });
            
            socket.on('entriesUpdated', (data) => {
                entryCountEl.textContent = data.length;
                entriesEl.textContent = JSON.stringify(data, null, 2).substring(0, 500) + '...';
                logToPage('Received ' + data.length + ' entries');
            });
            
            socket.on('handshakeConfirmed', (data) => {
                handshakeResponseEl.textContent = JSON.stringify(data);
                logToPage('Handshake confirmed');
            });
        }
        
        // Add event listeners
        connectBtn.addEventListener('click', connect);
        
        disconnectBtn.addEventListener('click', () => {
            if (socket) {
                socket.disconnect();
                logToPage('Manually disconnected');
            }
        });
        
        handshakeBtn.addEventListener('click', () => {
            if (socket && socket.connected) {
                socket.emit('handshake', { 
                    clientTime: new Date().toISOString(),
                    userAgent: navigator.userAgent
                });
                logToPage('Sent handshake');
            } else {
                logToPage('Cannot send handshake - not connected');
            }
        });
        
        // Initialize
        logToPage('Page loaded. Click "Connect" to establish Socket.IO connection');
    </script>
</body>
</html>