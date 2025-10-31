<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request){
        if($request->has('search')){
            $searchTerm = $request->input('search');
            $query = Customer::whereAny(['first_name', 'last_name'], 'LIKE', "%{$searchTerm}%");

            $customers = $query->get();
            return CustomerResource::collection($customers);
        }
    }
}
