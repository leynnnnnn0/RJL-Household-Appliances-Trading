<?php

namespace App\Http\Controllers;

use App\Http\Resources\ItemResource;
use App\Models\Item;
use Illuminate\Http\Request;

use function Pest\Laravel\json;

class ItemAPIController extends Controller
{
    public function index(Request $request){
        if($request->has('search')){
            $searchTerm = $request->input('search');
            $query = Item::whereAny(['description', 'model', 'serial'], 'LIKE', "%{$searchTerm}%");
            $query->where('date_out', null);
            if($request->has('location')){
                $query->where('location_id', $request->input('location'));
            }
            $items = $query->get();
            return ItemResource::collection($items);
        }
    }
}
