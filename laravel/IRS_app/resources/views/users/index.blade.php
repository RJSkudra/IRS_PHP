<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IRS datu ievade</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>
    <div class="form-container">
        <h1 class="form-title">IRS datu ievade</h1>
        @if ($errors->any())
             <div class="message error-message">
                 <ul>
                     @foreach ($errors->all() as $error)
                          <li>{{ $error }}</li>
                     @endforeach
                 </ul>
             </div>
        @endif
        @if (session('success'))
             <div class="message success">{{ session('success') }}</div>
        @endif
        <form method="post" action="{{ route('users.store') }}">
             @csrf
             <div class="form-grid">
                 <div class="form-group">
                     <label for="name">Vārds</label>
                     <input type="text" id="name" name="name" value="{{ old('name') }}">
                 </div>
                 <div class="form-group">
                     <label for="surname">Uzvārds</label>
                     <input type="text" id="surname" name="surname" value="{{ old('surname') }}">
                 </div>
                 <div class="form-group">
                     <label for="age">Vecums</label>
                     <input type="text" id="age" name="age" value="{{ old('age') }}">
                 </div>
                 <div class="form-group">
                     <label for="phone">Telefona nr.</label>
                     <input type="tel" id="phone" name="phone" value="{{ old('phone') }}">
                 </div>
                 <div class="form-group full-width">
                     <label for="address">Adrese</label>
                     <input type="text" id="address" name="address" value="{{ old('address') }}">
                 </div>
                 <div class="button-group">
                     <input type="submit" value="Iesniegt" class="button submit-button">
                 </div>
             </div>
        </form>
        <form method="post" action="{{ route('users.deleteAll') }}">
             @csrf
             <input type="submit" value="Dzēst visus ierakstus" class="button delete-all-button">
        </form>
        @if ($users->count())
             <h2>Lietotāju saraksts</h2>
             <table class="users-table">
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
                 @foreach ($users as $user)
                     <tr>
                          <td>{{ $user->id }}</td>
                          <td>{{ $user->name }}</td>
                          <td>{{ $user->surname }}</td>
                          <td>{{ $user->age }}</td>
                          <td>{{ $user->phone }}</td>
                          <td>{{ $user->address }}</td>
                          <td>{{ $user->created_at }}</td>
                          <td>
                          <form method="post" action="{{ route('users.destroy', $user) }}">
                            @csrf
                            <input type="hidden" name="_method" value="DELETE">
                            <input type="submit" value="Dzēst" class="button delete-button">
                        </form>
                          </td>
                     </tr>
                 @endforeach
             </table>
        @endif
        <div class="footer">
             IRS™ © ® 2025
        </div>
    </div>
</body>
</html>
