<?php

namespace App\Http\Controllers;

use App\Models\InstallmentOrderRemark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InstallmentOrderRemarkController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'installment_order_id' => 'required',
            'remarks' => 'required'
        ]);

        $validated['user_id'] = Auth::id();

        InstallmentOrderRemark::create($validated);

        return back();
    }

    public function destroy($id)
    {
        $remark = InstallmentOrderRemark::findOrFail($id);
        if(Auth::id() != $remark->user_id) return response('You are not allowed to remove this remark.');
        $remark->delete();
        return back();
    }
}
