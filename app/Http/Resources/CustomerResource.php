<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'phone_number' => $this->phone_number,
            'address' => $this->address,
            'email' => $this->email,
            'city' => $this->city,
            'province' => $this->province,
            'zipcode' => $this->zipcode,
            'country' => $this->country,
            'reference' => [
                'id' => $this->customer_reference?->id,
                'full_name' => $this->customer_reference?->full_name,
                'phone_number' => $this->customer_reference?->phone_number
            ],
            'investigation_detail' => [
                'id' => $this->investigation_detail?->id,
                'employee_id' => $this->investigation_detail?->employee_id,
                'home_visit_date' => $this->investigation_detail?->home_visit_date,
                'is_employment_verified' => $this->investigation_detail?->is_employment_verified,
                'investigation_notes' => $this->investigation_detail?->investigation_notes,
                'id_presented' => $this->investigation_detail?->id_presented,
                'id_number' => $this->investigation_detail?->id_number,
                'civil_status' => $this->investigation_detail?->civil_status,
                'spouse_name' => $this->investigation_detail?->spouse_name,
                'spouse_contact_number' => $this->investigation_detail?->spouse_contact_number,
            ]
        ];
    }
}
