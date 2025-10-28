<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
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
            'supplier' => $this->supplier,
            'description' => $this->description,
            'model' => $this->model,
            'serial' => $this->serial,
            'unit_cost' => $this->unit_cost,
            'srp' => $this->srp,
        ];
    }
}
