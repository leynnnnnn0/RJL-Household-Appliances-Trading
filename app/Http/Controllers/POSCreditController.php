<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSCreditController extends Controller
{
    public function index(Request $request)
    {
        $nameSearch = $request->input('nameSearch');

        if($nameSearch){
            $customer = Customer::whereAny(['first_name', 'last_name'], 'like', "%" + $nameSearch + '%')->firstOrFail();
        }
        
        return Inertia::render('POSCredit/Index');
    }

    
}
