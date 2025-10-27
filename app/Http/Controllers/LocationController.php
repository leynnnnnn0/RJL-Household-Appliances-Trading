<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::latest()->paginate(8);
        return Inertia::render('Location/Index', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request){
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'remarks' => 'nullable|string|max:1000',
        ]);

        Location::create($validated);

        return redirect()->back()->with('success', 'Location created successfully.');
    }

    public function update(Request $request, $id)
    {
         $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'remarks' => 'nullable|string|max:1000',
        ]);

        Location::findOrFail($id)->update($validated);
        return redirect()->back()->with('success', 'Location updated successfully.');
    }

    public function destroy($id){
        try {
            Location::findOrFail($id)->delete();
            return redirect()->back()->with('success', 'Location deleted successfully.');
        }catch(Exception $e){
             return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
        
    }
}
