<?php

namespace App\Http\Controllers;

use App\Models\AdditionalDocument;
use App\Models\Customer;
use App\Services\People\CustomerService;

class CustomerDocumentController extends Controller
{
    public function __construct(private CustomerService $customers) {}

    public function destroy(Customer $customer, AdditionalDocument $document)
    {
        $this->customers->deleteDocument($customer, $document);

        return redirect()->back()->with('success', 'Document deleted successfully!');
    }
}
