<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FacilityController extends Controller
{
    public function index()
    {
        // Ambil semua fasilitas yang statusnya aktif aja buat landing page
        $facilities = Facility::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'message' => 'List data fasilitas KST Ngijo berhasil diambil.',
            'data'    => $facilities
        ], 200);
    }

    public function store(Request $request)
    {
        // Validasi inputan biar gak ada data ngaco masuk ke Postgres
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'location'    => 'required|string|max:255',
            'image_url'   => 'nullable|url',
            'is_active'   => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal, cek inputan lo.',
                'errors'  => $validator->errors()
            ], 422);
        }

        // Kalau lolos validasi, buat data baru (aman karena udah set $fillable di Model)
        $facility = Facility::create([
            'name'        => $request->name,
            'description' => $request->description,
            'location'    => $request->location,
            'image_url'   => $request->image_url,
            'is_active'   => $request->input('is_active', true)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas baru berhasil ditambahkan.',
            'data'    => $facility
        ], 201);
    }

    public function show($id)
    {
        $facility = Facility::find($id);

        if (!$facility) {
            return response()->json([
                'success' => false,
                'message' => 'Data fasilitas gak ketemu, Va.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail data fasilitas berhasil ditemukan.',
            'data'    => $facility
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $facility = Facility::find($id);

        if (!$facility) {
            return response()->json([
                'success' => false,
                'message' => 'Fasilitas yang mau lo update gak ada.'
            ], 404);
        }

        // Validasi data update (pake 'sometimes' biar misal admin cuma mau ganti nama doang tetep lolos)
        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'location'    => 'sometimes|required|string|max:255',
            'image_url'   => 'nullable|url',
            'is_active'   => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Update gagal, data gak valid.',
                'errors'  => $validator->errors()
            ], 422);
        }

        // Eksekusi update
        $facility->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data fasilitas berhasil diperbarui.',
            'data'    => $facility
        ], 200);
    }

    public function destroy($id)
    {
        $facility = Facility::find($id);

        if (!$facility) {
            return response()->json([
                'success' => false,
                'message' => 'Data emang kagak ada dari awal, Va.'
            ], 404);
        }

        $facility->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas resmi didelete dari KST Ngijo.'
        ], 200);
    }
}