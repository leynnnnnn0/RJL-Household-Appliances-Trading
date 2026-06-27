<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Services\References\LocationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use RuntimeException;

class LocationController extends Controller
{
    public function __construct(private LocationService $locations) {}

    public function index(Request $request)
    {
        return Inertia::render('Location/Index', [
            'locations' => $this->locations->paginate($request->input('search')),
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->locations->create($this->validatedData($request));

        return redirect()->back()->with('success', 'Location created successfully.');
    }

    public function update(Request $request, Location $location)
    {
        $this->locations->update($location, $this->validatedData($request, $location));

        return redirect()->back()->with('success', 'Location updated successfully.');
    }

    public function destroy(Location $location)
    {
        try {
            $this->locations->delete($location);

            return redirect()->back()->with('success', 'Location deleted successfully.');
        } catch (RuntimeException $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    private function validatedData(Request $request, ?Location $location = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('locations', 'name')->ignore($location?->id),
            ],
            'address' => ['nullable', 'string', 'max:500'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
