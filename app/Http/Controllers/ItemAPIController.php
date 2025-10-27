<?php

namespace App\Http\Controllers;

use App\Http\Resources\ItemResource;
use App\Models\Item;
use Illuminate\Http\Request;

class ItemAPIController extends Controller
{
    public function index(Request $request){
        if($request->has('search')){
            $searchTerm = $request->input('search');
            $items = Item::whereAny(['description', 'model', 'serial'], 'LIKE', "%{$searchTerm}%")->get();
            return ItemResource::collection($items);
        }
    }
}
