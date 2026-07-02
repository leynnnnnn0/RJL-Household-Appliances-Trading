<?php

namespace App\Services\POSCredit;

use App\Models\Customer;
use App\Models\InstallmentOrder;
use App\Models\Item;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class POSCreditService
{
    public function __construct(private readonly POSCreditCalculator $calculator) {}

    public function todayTransactionsForCurrentUser(): Collection
    {
        return InstallmentOrder::with('customer')
            ->when(! Auth::user()->getRoleNames()->contains('super admin'), fn ($query) => $query->where('user_id', Auth::id()))
            ->whereDate('transaction_date', today())
            ->latest()
            ->get()
            ->map(fn (InstallmentOrder $transaction) => [
                'order_number' => $transaction->order_number,
                'customer' => $transaction->customer->full_name,
                'term' => $transaction->number_of_terms,
            ]);
    }

    public function createOrder(array $data, array $documents = []): InstallmentOrder
    {

        return DB::transaction(function () use ($data, $documents) {
            $items = $data['items'];
            $freeItems = $data['free_items'] ?? [];
            $calculation = $this->calculator->calculate($data);

            if (empty($items)) {
                throw new Exception('At least one paid item is required');
            }

            $customer = $this->upsertCustomer($data);
            $this->storeDocuments($customer, $documents);
            $this->upsertReference($customer, $data);
            $this->upsertInvestigationDetail($customer, $data);

            $order = InstallmentOrder::create([
                'customer_id' => $customer->id,
                'location_id' => 1,
                'branch_id' => $data['location_id'],
                'user_id' => Auth::id(),
                'order_number' => $this->generateOrderNumber(),
                'loan_contract_price' => $calculation['loan_contract_price'],
                'lcp_markup_rate' => $calculation['lcp_markup_rate'],
                'lcp_additional_charge' => $calculation['lcp_additional_charge'],
                'down_payment' => $calculation['down_payment'],
                'payment_method' => $data['payment_method'] ?? null,
                'reference_number' => $data['reference_number'] ?? null,
                'promisory_note_value' => $calculation['promisory_note_value'],
                'number_of_terms' => $data['number_of_terms'],
                'promisory_note_value_interest' => $calculation['promisory_note_value_interest'],
                'promisory_note_value_interest_additional_charge' => $calculation['promisory_note_value_interest_additional_charge'],
                'transaction_date' => $data['transaction_date'],
                'receipt_number' => $data['receipt_number'],
            ]);

            $this->createOrderItems($order, $items, $freeItems);
            $this->createPaymentSchedule($order, $calculation['installment_total']);

            return $order;
        });
    }

    public function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $lastOrder = InstallmentOrder::whereDate('created_at', today())
            ->latest('id')
            ->first();

        $sequence = $lastOrder ? intval(substr($lastOrder->order_number, -4)) + 1 : 1;

        return 'IORD-'.$date.'-'.str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    private function upsertCustomer(array $data): Customer
    {
        $customerData = [
            'first_name' => $data['customer_first_name'],
            'last_name' => $data['customer_last_name'],
            'address' => $data['customer_address'],
            'phone_number' => $data['customer_phone_number'] ?? null,
            'email' => $data['email'] ?? null,
            'city' => $data['city'],
            'province' => $data['province'],
            'zipcode' => $data['zipcode'] ?? null,
            'country' => $data['country'],
        ];

        if (($data['customer_id'] ?? null) === null) {
            return Customer::create($customerData);
        }

        $customer = Customer::findOrFail($data['customer_id']);
        $customer->update($customerData);

        return $customer;
    }

    private function storeDocuments(Customer $customer, array $documents): void
    {
        foreach ($documents as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store('customer-documents', 'public');

            $customer->additional_documents()->create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);
        }
    }

    private function upsertReference(Customer $customer, array $data): void
    {
        $customer->customer_reference()->updateOrCreate(
            ['customer_id' => $customer->id],
            [
                'full_name' => $data['customer_reference_full_name'],
                'phone_number' => $data['customer_reference_phone_number'],
            ]
        );
    }

    private function upsertInvestigationDetail(Customer $customer, array $data): void
    {
        $customer->investigation_detail()->updateOrCreate(
            ['customer_id' => $customer->id],
            [
                'employee_id' => $data['investigator_id'],
                'home_visit_date' => $data['home_visit_date'],
                'is_employment_verified' => $data['is_employment_verified'],
                'investigation_notes' => $data['investigation_notes'] ?? null,
                'id_presented' => $data['id_presented'] ?? null,
                'id_number' => $data['id_number'] ?? null,
                'civil_status' => $data['civil_status'] ?? null,
                'spouse_name' => $data['spouse_name'] ?? null,
                'spouse_contact_number' => $data['spouse_contact_number'] ?? null,
            ]
        );
    }

    private function createOrderItems(InstallmentOrder $order, array $items, array $freeItems): void
    {
        $paidInventoryItems = Item::whereNull('date_out')
            ->whereIn('id', collect($items)->pluck('item_id'))
            ->get()
            ->keyBy('id');

        $freeInventoryItems = Item::whereIn('id', collect($freeItems)->pluck('item_id'))
            ->get()
            ->keyBy('id');

        foreach ($items as $item) {
            $inventoryItem = $paidInventoryItems->get($item['item_id']);

            if (! $inventoryItem) {
                throw new Exception('No query results for model [App\\Models\\Item] '.$item['item_id']);
            }

            $order->installment_order_items()->create([
                'item_id' => $item['item_id'],
                'serial' => $item['serial'],
                'sale_amount' => $item['srp'],
                'discount_amount' => 0,
            ]);

            $inventoryItem->update(['date_out' => Carbon::parse($order->transaction_date)->toDateString()]);
        }

        foreach ($freeItems as $freeItem) {
            $inventoryItem = $freeInventoryItems->get($freeItem['item_id']);

            if (! $inventoryItem) {
                throw new Exception('No query results for model [App\\Models\\Item] '.$freeItem['item_id']);
            }

            $order->installment_order_items()->create([
                'item_id' => $freeItem['item_id'],
                'serial' => $freeItem['serial'],
                'sale_amount' => 0,
                'discount_amount' => $inventoryItem->srp,
            ]);

            $inventoryItem->update(['date_out' => Carbon::parse($order->transaction_date)->toDateString()]);
        }
    }

    private function createPaymentSchedule(InstallmentOrder $order, float $total): void
    {
        $monthlyPayment = $total / $order->number_of_terms;

        for ($installmentNumber = 1; $installmentNumber <= $order->number_of_terms; $installmentNumber++) {
            $order->installment_order_payments()->create([
                'installment_number' => $installmentNumber,
                'amount_due' => $monthlyPayment,
                'amount_paid' => 0,
                'due_date' => Carbon::parse($order->transaction_date)->addMonths($installmentNumber),
                'payment_method' => null,
                'reference_number' => null,
                'status' => 'pending',
                'paid_date' => null,
            ]);
        }
    }
}
