<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Config;

class SocketService
{
    protected $client;
    protected $socketUrl;
    
    public function __construct()
    {
        $this->client = new Client();
        $this->socketUrl = env('SOCKET_SERVER_URL', 'http://localhost:4000');
    }
    
    public function updateEntries($entries)
    {
        return $this->client->post($this->socketUrl . '/api/update-entries', [
            'json' => ['entries' => $entries]
        ]);
    }
}