<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('role');
        
        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }
        
        $users = $query->paginate($request->per_page ?? 20);
        
        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ]
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id',
        ]);
        
        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'status' => 'active',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user->load('role')
        ], 201);
    }
    
    public function show(string $id)
    {
        $user = User::with('role')->find($id);
        
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }
        
        return response()->json(['success' => true, 'data' => $user]);
    }
    
    public function update(Request $request, string $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $id,
            'role_id' => 'exists:roles,id',
            'status' => 'in:active,inactive,suspended',
        ]);
        
        $user->update($validated);
        
        return response()->json(['success' => true, 'data' => $user->load('role')]);
    }
    
    public function destroy(string $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }
        
        $user->delete();
        
        return response()->json(['success' => true, 'message' => 'User deleted successfully']);
    }
    
    public function roles()
    {
        $roles = Role::all();
        return response()->json(['success' => true, 'data' => $roles]);
    }

    public function directory(Request $request)
    {
        $users = User::select('id', 'name')
            ->where('status', 'active')
            ->when($request->filled('search'), fn($q) =>
                $q->where('name', 'like', '%' . $request->search . '%')
            )
            ->orderBy('name')
            ->get();

        return response()->json(['success' => true, 'data' => $users]);
    }
}
