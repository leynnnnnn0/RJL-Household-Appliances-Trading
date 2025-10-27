<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class POSCashController extends Controller
{
    public function index()
    {
        return Inertia::render('POSCash/Index');
    }

    public function search()
    {
        dd($_GET);
    }
}
