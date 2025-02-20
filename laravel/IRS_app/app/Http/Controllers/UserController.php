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
            'name' => 'required|regex:/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]{2,50}$/u',
            'surname' => 'required|regex:/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]{2,50}$/u',
            'age' => 'required|integer|min:0|max:200',
            'phone' => 'required|regex:/^[0-9]{8}$/',
            'address' => 'required|regex:/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9\s,.,-āĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ]+$/u',
        ]);

        User::create($request->all());
        return redirect()->route('users.index')->with('success', __('validation.success.created'));
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', __('validation.success.deleted'));
    }

    public function deleteAll()
    {
        User::truncate();
        return redirect()->route('users.index')->with('success', __('validation.success.all_deleted'));
    }
}