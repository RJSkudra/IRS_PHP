<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class SocketService
{
    protected $client;
    protected $socketUrl;
    
    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 15,
            'connect_timeout' => 15,
            'http_errors' => false,
            'verify' => false // Disable SSL verification for development
        ]);
        
        // Get the socket URL from env or use a fallback
        $this->socketUrl = rtrim(env('SOCKET_SERVER_URL', 'http://localhost:4000'), '/');
        
        Log::info("Socket service initialized with URL: {$this->socketUrl}");
    }
    
    public function updateEntries($entries)
    {
        try {
            $endpoint = $this->socketUrl . '/api/update-entries';
            Log::info("Making request to: {$endpoint}");
            
            $response = $this->client->post($endpoint, [
                'json' => ['entries' => $entries],
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ]
            ]);
            
            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody(), true);
            
            Log::info("Socket service update response: $statusCode", [
                'body' => $body
            ]);
            
            return [
                'success' => $statusCode >= 200 && $statusCode < 300,
                'status' => $statusCode,
                'body' => $body
            ];
        } catch (RequestException $e) {
            Log::error('Socket service error: ' . $e->getMessage(), [
                'url' => $this->socketUrl . '/api/update-entries',
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public function healthCheck()
    {
        try {
            // Use the health endpoint instead of health-check
            $endpoint = $this->socketUrl . '/health';
            Log::info("Making health check request to: {$endpoint}");
            
            $response = $this->client->get($endpoint, [
                'timeout' => 5
            ]);
            
            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody(), true);
            
            Log::info("Socket service health check response: $statusCode", [
                'body' => $body
            ]);
            
            return [
                'success' => $statusCode >= 200 && $statusCode < 300,
                'status' => $statusCode,
                'body' => $body
            ];
        } catch (RequestException $e) {
            Log::error('Socket service health check error: ' . $e->getMessage(), [
                'url' => $this->socketUrl . '/health',
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Delete an entry via the Socket.IO server
     */
    public function deleteEntry($id)
    {
        try {
            $endpoint = $this->socketUrl . '/api/delete/' . $id;
            Log::info("Making delete request to: {$endpoint}");
            
            $response = $this->client->delete($endpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ]
            ]);
            
            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody(), true);
            
            Log::info("Socket service delete response: $statusCode", [
                'body' => $body
            ]);
            
            return [
                'success' => $statusCode >= 200 && $statusCode < 300,
                'status' => $statusCode,
                'body' => $body
            ];
        } catch (RequestException $e) {
            Log::error('Socket service delete error: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}