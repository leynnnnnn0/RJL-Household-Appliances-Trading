<?php

namespace App\Services\People;

use App\Models\AdditionalDocument;
use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CustomerService
{
    public function paginate(?string $search = null, int $perPage = 8): LengthAwarePaginator
    {
        return Customer::query()
            ->when($search, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->whereAny(['first_name', 'last_name', 'address', 'phone_number', 'email'], 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function update(Customer $customer, array $data, array $documents = []): Customer
    {
        return DB::transaction(function () use ($customer, $data, $documents) {
            $customer->update([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'] ?? null,
                'address' => $data['address'],
                'city' => $data['city'],
                'province' => $data['province'],
                'zipcode' => $data['zipcode'] ?? null,
                'country' => $data['country'],
                'phone_number' => $data['phone_number'] ?? null,
            ]);

            $customer->customer_reference()->updateOrCreate(
                ['customer_id' => $customer->id],
                [
                    'full_name' => $data['reference_full_name'],
                    'phone_number' => $data['reference_phone_number'],
                ],
            );

            $investigationDetails = [
                'employee_id' => $data['employee_id'],
                'home_visit_date' => $data['home_visit_date'],
                'is_employment_verified' => $data['is_employment_verified'],
                'investigation_notes' => $data['investigation_notes'],
            ];

            foreach ([
                'id_presented',
                'id_number',
                'civil_status',
                'spouse_name',
                'spouse_contact_number',
            ] as $optionalField) {
                if (array_key_exists($optionalField, $data)) {
                    $investigationDetails[$optionalField] = $data[$optionalField];
                }
            }

            $customer->investigation_detail()->updateOrCreate(
                ['customer_id' => $customer->id],
                $investigationDetails,
            );

            foreach ($documents as $file) {
                if ($file instanceof UploadedFile) {
                    $this->storeDocument($customer, $file);
                }
            }

            return $customer->refresh();
        });
    }

    public function deleteDocument(Customer $customer, AdditionalDocument $document): void
    {
        if ($document->customer_id !== $customer->id) {
            abort(404);
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();
    }

    private function storeDocument(Customer $customer, UploadedFile $file): void
    {
        $path = $file->store('customer-documents', 'public');

        $customer->additional_documents()->create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);
    }
}
