<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>IRS datu ievade</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="icon" href="https://img.icons8.com/ultraviolet/80/data-configuration.png" type="image/png">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="{{ asset('js/validation.js') }}" defer></script>
    <script src="{{ asset('js/ajax.js') }}" defer></script>
    @viteReactRefresh
    @vite('resources/js/app.jsx')
</head>
<body>
    <div class="form-container">
        <h1 class="form-title">IRS datu ievade</h1>
        @if (session('success'))
            <div class="message success">{{ session('success') }}</div>
        @endif
        <form id="userForm" method="post" action="{{ route('users.store') }}" onsubmit="return false;">
            @csrf
            <div class="form-grid">
                <div class="form-group">
                    <label for="name">Vārds</label>
                    <input type="text" id="name" name="name" value="{{ old('name') }}">
                    <div class="error-message" id="name-error"></div>
                    @error('name')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="surname">Uzvārds</label>
                    <input type="text" id="surname" name="surname" value="{{ old('surname') }}">
                    <div class="error-message" id="surname-error"></div>
                    @error('surname')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="age">Vecums</label>
                    <input type="text" id="age" name="age" value="{{ old('age') }}">
                    <div class="error-message" id="age-error"></div>
                    @error('age')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="phone">Telefona nr.</label>
                    <input type="tel" id="phone" name="phone" value="{{ old('phone') }}">
                    <div class="error-message" id="phone-error"></div>
                    @error('phone')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-group full-width">
                    <label for="address">Adrese</label>
                    <input type="text" id="address" name="address" value="{{ old('address') }}">
                    <div class="error-message" id="address-error"></div>
                    @error('address')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
            </div>
            <div class="button-group">
                <input type="submit" value="Iesniegt" class="button submit-button" disabled onclick="submitForm()">
            </div>
        </form>

        <div class="button-group" id="deleteAllContainer" style="display: none;">
            <form id="deleteAllForm" method="post" action="{{ route('users.deleteAll') }}" onsubmit="return false;">
                @csrf
                <input type="submit" value="Dzēst visus ierakstus" class="button delete-all-button" onclick="deleteAllEntries()">
            </form>
        </div>
        
        <h2 id="tableHeading" style="display: none;">Lietotāju saraksts</h2>
        <table class="users-table" id="usersTable" style="display: none;">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Vārds</th>
                    <th>Uzvārds</th>
                    <th>Vecums</th>
                    <th>Telefons</th>
                    <th>Adrese</th>
                    <th>Reģistrācijas datums</th>
                    <th>Darbība</th>
                </tr>
            </thead>
            <tbody id="usersTableBody">

                <!-- table.blade.php saturs būs dinamiski ievadīts šeit -->
            </tbody>
        </table>

        <div class="footer">
            IRS™ © ® 2025
        </div>
    </div>
</body>
</html>