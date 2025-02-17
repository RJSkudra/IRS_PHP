<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return view('users.index', compact('users'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|regex:/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]{2,}$/u',
            'surname' => 'required|regex:/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]{2,}$/u',
            'age' => 'required|integer',
            'phone' => 'required|regex:/^[0-9]{8}$/',
            'address' => 'required|regex:/^[a-zA-Z0-9\s,.,-]+$/u',
        ]);

        User::create($request->all());

        return redirect()->route('users.index')->with('success', 'Ieraksts veiksmīgi pievienots');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'Ieraksts veiksmīgi dzēsts');
    }

    public function deleteAll()
    {
        User::truncate();
        return redirect()->route('users.index')->with('success', 'Visi ieraksti veiksmīgi dzēsti');
    }
}