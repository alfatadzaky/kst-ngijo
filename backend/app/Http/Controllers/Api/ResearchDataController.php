<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\ResearchOutput;
use App\Models\ResearchCollaborator;
use App\Models\Researcher;
use Illuminate\Http\Request;

class ResearchDataController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchProject::with(['principalInvestigator', 'collaborators', 'outputs']);

        if ($request->filled('status'))   $query->where('status', $request->status);
        if ($request->filled('category')) $query->where('category', $request->category);
        if ($request->filled('trl_level')) {
            $query->where('trl_level', $request->trl_level);
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        $data = $query->orderBy('start_date', 'desc')->paginate($request->per_page ?? 20);

        return response()->json([
            'success'    => true,
            'data'       => $data->items(),
            'pagination' => [
                'total'        => $data->total(),
                'per_page'     => $data->perPage(),
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string|max:1000',
            'start_date'   => 'required|date|before_or_equal:today',
            'end_date'     => 'nullable|date|after:start_date',
            'category'     => 'required|in:technology,agriculture,energy,sustainability,other',
            'kepala_riset' => 'required|string|max:255',
            'budget'       => 'nullable|integer|min:0',
            'collaborators'=> 'nullable|array',
            'trl_level'    => 'nullable|integer|min:1|max:9',
        ]);

        // Find-or-create researcher (exact match setelah normalize whitespace)
        $researcher = Researcher::firstOrCreate([
            'name' => preg_replace('/\s+/', ' ', trim($validated['kepala_riset']))
        ]);

        $project = ResearchProject::create([
            'title'                    => $validated['title'],
            'description'              => $validated['description'] ?? null,
            'start_date'               => $validated['start_date'],
            'end_date'                 => $validated['end_date'] ?? null,
            'category'                 => $validated['category'],
            'principal_investigator_id'=> $researcher->id,
            'budget'                   => $validated['budget'] ?? null,
            'trl_level'                => $validated['trl_level'] ?? 1,
            'status'                   => 'active',
            'created_by_user_id'       => auth('api')->id(),
        ]);

        if ($request->filled('collaborators')) {
            foreach ($request->collaborators as $collab) {
                ResearchCollaborator::create([
                    'research_project_id' => $project->id,
                    ...$collab,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Research project created successfully',
            'data'    => $project->load(['principalInvestigator', 'collaborators', 'outputs'])
        ], 201);
    }

    public function show($id)
    {
        $data = ResearchProject::with(['principalInvestigator', 'collaborators', 'outputs'])->find($id);

        if (!$data) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function update(Request $request, $id)
    {
        $project = ResearchProject::find($id);

        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'title'        => 'string|max:255',
            'description'  => 'nullable|string|max:1000',
            'end_date'     => 'nullable|date|after:start_date',
            'status'       => 'in:planning,active,completed,paused',
            'budget'       => 'nullable|integer|min:0',
            'trl_level'    => 'nullable|integer|min:1|max:9',
            'kepala_riset' => 'nullable|string|max:255',
        ]);

        // Kalau kepala_riset di-update
        if (!empty($validated['kepala_riset'])) {
            $researcher = Researcher::firstOrCreate([
                'name' => preg_replace('/\s+/', ' ', trim($validated['kepala_riset']))
            ]);
            $validated['principal_investigator_id'] = $researcher->id;
        }
        unset($validated['kepala_riset']); // jangan masuk ke kolom projects

        $project->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $project->load(['principalInvestigator', 'collaborators', 'outputs'])
        ]);
    }

    public function destroy($id)
    {
        $project = ResearchProject::find($id);

        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        $project->delete();

        return response()->json(['success' => true, 'message' => 'Project deleted successfully']);
    }

    public function addOutput(Request $request, $id)
    {
        $project = ResearchProject::find($id);

        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Project not found'], 404);
        }

        $validated = $request->validate([
            'output_type'   => 'required|in:publication,patent,prototype,report,other',
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'date_produced' => 'required|date|before_or_equal:today',
            'link'          => 'nullable|url',
        ]);

        $output = ResearchOutput::create([
            'research_project_id' => $project->id,
            ...$validated,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Output added successfully',
            'data'    => $output
        ], 201);
    }

    // Endpoint untuk datalist autocomplete di frontend
    public function researchers(Request $request)
    {
        $researchers = Researcher::select('id', 'name')
            ->when($request->filled('search'), fn($q) =>
                $q->where('name', 'like', '%' . $request->search . '%')
            )
            ->orderBy('name')
            ->get();

        return response()->json(['success' => true, 'data' => $researchers]);
    }
}