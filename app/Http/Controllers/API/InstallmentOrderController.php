<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\InstallmentOrderResource;
use App\Models\InstallmentOrder;
use Illuminate\Http\Request;

use function Pest\Laravel\json;

class InstallmentOrderController extends Controller
{
    public function index(Request $request)
{
    $search = $request->input('search');
    
    if($search == null) {
        return response()->json([
            'data' => [],
            'message' => 'empty query'
        ]);
    }
    
    $data = InstallmentOrder::with(['installment_order_payments', 'customer', 'installment_order_item.item'])
        ->where(function($query) use($search) {
            $query->where('order_number', 'like', "%$search%")
                ->orWhereHas('customer', function($q) use($search) {
                    $q->whereAny(['first_name', 'last_name'], 'like', "%$search%");
                });
        })
        ->get();
        
    return InstallmentOrderResource::collection($data);
}
}
