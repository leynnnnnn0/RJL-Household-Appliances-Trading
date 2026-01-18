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
            if($request->has('is_defaulted') && $request->input('is_defaulted') == 'true'){

                $searchTerm = $request->input('search');
                $query = Item::whereAny(['description', 'model', 'serial'], 'LIKE', "%{$searchTerm}%");
                $query->whereHas('installment_orders', function($q){
                    $q->where('is_defaulted', true);
                });
            } else {
                $searchTerm = $request->input('search');
                $query = Item::whereAny(['description', 'model', 'serial'], 'LIKE', "%{$searchTerm}%");
                $query->where('date_out', null);
            }
         
            $items = $query->get();
            return ItemResource::collection($items);
        }
    }
}
