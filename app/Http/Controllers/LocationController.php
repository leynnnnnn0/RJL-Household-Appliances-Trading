<?php

namespace App\Http\Controllers;

use App\Http\Requests\References\UpsertLocationRequest;
use App\Models\Location;
use App\Services\References\LocationService;
use Illuminate\Http\Request;
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

    public function store(UpsertLocationRequest $request)
    {
        $this->locations->create($request->validated());

        return redirect()->back()->with('success', 'Location created successfully.');
    }

    public function update(UpsertLocationRequest $request, Location $location)
    {
        $this->locations->update($location, $request->validated());

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
}
