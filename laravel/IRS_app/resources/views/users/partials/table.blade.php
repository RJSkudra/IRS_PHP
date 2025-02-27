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
                <form method="post" action="{{ route('users.destroy', $user->id) }}">
                    @csrf
                    @method('DELETE')
                    <input type="submit" value="Dzēst" class="button delete-button">
                </form>
            </td>
        </tr>
    @endforeach
