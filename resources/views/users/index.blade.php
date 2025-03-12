<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>IRS datu ievade</title>
    <link rel="icon" href="https://img.icons8.com/ultraviolet/80/data-configuration.png" type="image/png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    
    @viteReactRefresh
    @if(request()->query('framework') === 'vue')
        @vite(['resources/sass/app.scss', 'resources/js/app.js'])
    @else
        @vite(['resources/sass/app.scss', 'resources/js/ReactApp.jsx'])
    @endif
</head>
<body class="bg-gray-100">
    <div class="framework-toggle">
        <a href="?framework={{ request()->query('framework') === 'vue' ? 'react' : 'vue' }}" class="framework-button">
            Switch to {{ request()->query('framework') === 'vue' ? 'React' : 'Vue' }}
        </a>
    </div>
    <div id="app"></div>

    <style>
        .framework-toggle {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
        }
        .framework-button {
            padding: 8px 16px;
            background-color: #2563eb;
            color: white;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: background-color 0.3s;
        }
        .framework-button:hover {
            background-color: #1d4ed8;
        }
    </style>
</body>
</html>