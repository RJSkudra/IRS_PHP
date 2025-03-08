<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        $usersCount = $users->count();
        
        if (request()->ajax()) {
            return view('users.partials.table', compact('users'))->render();
        }
        
        return view('users.index', compact('users', 'usersCount'));
    }

    public function getEntries()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|regex:/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]{2,50}$/u',
            'surname' => 'required|regex:/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]{2,50}$/u',
            'age' => 'required|integer|min:0|max:200',
            'phone' => 'required|regex:/^[0-9]{8}$/',
            'address' => 'required|regex:/^(?=.*[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ])(?=.*[0-9])[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ0-9\s,.-]+$/u',
        ]);

        User::create($validated);
        
        if ($request->ajax()) {
            return response()->json(['success' => __('validation.success.created')]);
        }
        
        return redirect()->route('users.index')->with('success', __('validation.success.created'));
    }

    public function deleteAll()
    {
        User::truncate();
        
        if (request()->ajax()) {
            return response()->json(['success' => __('validation.success.all_deleted')]);
        }
        
        return redirect()->route('users.index')->with('success', __('validation.success.all_deleted'));
    }
    
    public function updateEntries(Request $request)
    {
        $entries = $request->input('entries');
        
        foreach ($entries as $entryData) {
            $entry = User::find($entryData['id']);
            if ($entry) {
                $entry->update($entryData);
            }
        }

        return response()->json(['message' => __('entryEdit.success.created')], 200);
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();
            
            if (request()->ajax()) {
                return response()->json(['success' => __('validation.success.deleted')]);
            }
            
            return redirect()->route('users.index')->with('success', __('validation.success.deleted'));
        } catch (\Exception $e) {
            if (request()->ajax()) {
                return response()->json(['error' => 'Error deleting record'], 500);
            }
            
            return redirect()->route('users.index')->with('error', 'Error deleting record');
        }
    }
}