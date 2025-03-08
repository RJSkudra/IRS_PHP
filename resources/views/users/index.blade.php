<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>IRS datu ievade</title>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    <link rel="icon" href="https://img.icons8.com/ultraviolet/80/data-configuration.png" type="image/png">
    @viteReactRefresh
    @vite(['resources/sass/app.scss', 'resources/js/app.jsx'])
</head>
<body class="bg-gray-100">
    <div id="app"></div>
</body>
</html>