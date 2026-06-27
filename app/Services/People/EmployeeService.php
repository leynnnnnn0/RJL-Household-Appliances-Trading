<?php

namespace App\Services\People;

use App\Models\Employee;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use RuntimeException;

class EmployeeService
{
    public function paginate(?string $search = null, int $perPage = 8): LengthAwarePaginator
    {
        return Employee::query()
            ->when($search, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Employee
    {
        return Employee::create($data);
    }

    public function update(Employee $employee, array $data): Employee
    {
        $employee->update($data);

        return $employee->refresh();
    }

    public function delete(Employee $employee): void
    {
        if ($employee->investigation_details()->exists()) {
            throw new RuntimeException('Cannot delete employee. They are assigned to customer investigations.');
        }

        $employee->delete();
    }
}
