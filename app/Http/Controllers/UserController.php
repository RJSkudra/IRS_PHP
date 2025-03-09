<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Services\SocketService;

class UserController extends Controller
{
    protected $socketService;
    
    public function __construct(SocketService $socketService)
    {
        $this->socketService = $socketService;
    }

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
        
        // Get all entries to broadcast
        $entries = User::all();
        
        // Notify Socket.io server about the change
        $this->socketService->updateEntries($entries);
        
        if ($request->ajax()) {
            return response()->json(['success' => __('validation.success.created')]);
        }
        
        return redirect()->route('users.index')->with('success', __('validation.success.created'));
    }

    public function deleteAll()
    {
        User::truncate();
        
        // Notify Socket.io server about the change
        $this->socketService->updateEntries([]);
        
        if (request()->ajax()) {
            return response()->json(['success' => __('validation.success.all_deleted')]);
        }
        
        return redirect()->route('users.index')->with('success', __('validation.success.all_deleted'));
    }

    public function updateEntries(Request $request)
    {
        $entries = $request->input('entries');
        $updatedEntries = [];
        
        foreach ($entries as $entryData) {
            $entry = User::find($entryData['id']);
            if ($entry) {
                // Validate the input data
                $validated = $this->validateEntryData($entryData);
                
                // Update only if validation passes
                if ($validated) {
                    $entry->update($entryData);
                    $updatedEntries[] = $entry;
                }
            }
        }
        
        // Notify Socket.io server if any entries were updated
        if (!empty($updatedEntries)) {
            $this->socketService->updateEntries(User::all());
        }

        return response()->json(['message' => __('entryEdit.success.created')], 200);
    }

    private function validateEntryData($entryData)
    {
        // Only validate if the field exists in the input data
        $rules = [];
        
        if (isset($entryData['name'])) {
            $rules['name'] = 'required|regex:/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]{2,50}$/u';
        }
        
        if (isset($entryData['surname'])) {
            $rules['surname'] = 'required|regex:/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\- ]{2,50}$/u';
        }
        
        if (isset($entryData['age'])) {
            $rules['age'] = 'required|integer|min:0|max:200';
        }
        
        if (isset($entryData['phone'])) {
            $rules['phone'] = 'required|regex:/^[0-9]{8}$/';
        }
        
        if (isset($entryData['address'])) {
            $rules['address'] = 'required|regex:/^(?=.*[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ])(?=.*[0-9])[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ0-9\s,.-]+$/u';
        }
        
        $validator = \Illuminate\Support\Facades\Validator::make($entryData, $rules);
        return !$validator->fails();
    }

    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();
            
            // Get all remaining entries to broadcast
            $entries = User::all();
            
            // Notify Socket.io server about the change
            $this->socketService->updateEntries($entries);
            
            return response()->json(['success' => 'Entry deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error deleting entry: ' . $e->getMessage()], 500);
        }
    }
}