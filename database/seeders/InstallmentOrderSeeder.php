<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\CustomerReference;
use App\Models\InvestigationDetail;
use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderItem;
use App\Models\InstallmentOrderPayment;
use App\Models\InstallmentOrderPaymentHistory;
use App\Models\Item;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InstallmentOrderSeeder extends Seeder
{
    private function calculateLCP($srp)
    {
        return $srp * 1.1 + 300;
    }

    private function getDefaultDownPaymentPercent($itemType)
    {
        if ($itemType === 'furniture' || $itemType === 'appliances') {
            return 0.15;
        }
        return 0.20;
    }

    private function getInterestConfig($itemType, $months)
    {
        $configs = [
            'furniture' => [
                3 => ['multiplier' => 1.12, 'fixedCharge' => 0],
                6 => ['multiplier' => 1.18, 'fixedCharge' => 300],
                9 => ['multiplier' => 1.21, 'fixedCharge' => 450],
                12 => ['multiplier' => 1.27, 'fixedCharge' => 600],
            ],
            'gadgets' => [
                3 => ['multiplier' => 1.10, 'fixedCharge' => 0],
                6 => ['multiplier' => 1.27, 'fixedCharge' => 300],
                9 => ['multiplier' => 1.3, 'fixedCharge' => 450],
                12 => ['multiplier' => 1.33, 'fixedCharge' => 600],
            ],
            'appliances' => [
                3 => ['multiplier' => 1.12, 'fixedCharge' => 0],
                6 => ['multiplier' => 1.18, 'fixedCharge' => 300],
                9 => ['multiplier' => 1.21, 'fixedCharge' => 450],
                12 => ['multiplier' => 1.27, 'fixedCharge' => 600],
            ],
        ];

        return $configs[$itemType][$months] ?? ['multiplier' => 1.12, 'fixedCharge' => 0];
    }

    private function generateOrderNumber()
    {
        return 'ORD-' . date('Y') . '-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $firstNames = [
            'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Miguel', 'Carmen',
            'Luis', 'Elena', 'Carlos', 'Sofia', 'Ramon', 'Isabel', 'Diego',
            'Patricia', 'Fernando', 'Angela', 'Ricardo', 'Lucia', 'Manuel',
            'Teresa', 'Antonio', 'Cristina', 'Roberto', 'Monica', 'Jorge',
            'Gloria', 'Francisco', 'Margarita', 'Alberto', 'Diana', 'Rafael',
            'Sandra', 'Enrique', 'Laura', 'Javier', 'Beatriz', 'Sergio', 'Raquel'
        ];

        $lastNames = [
            'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza',
            'Torres', 'Flores', 'Rivera', 'Ramos', 'Gonzales', 'Rodriguez',
            'Fernandez', 'Lopez', 'Martinez', 'Perez', 'Sanchez', 'Castillo',
            'Morales', 'Jimenez', 'Romero', 'Alvarez', 'Gutierrez', 'Herrera',
            'Medina', 'Ortiz', 'Castro', 'Vargas', 'Ruiz'
        ];

        $addresses = [
            'Quezon City', 'Manila', 'Caloocan', 'Las Piñas', 'Makati',
            'Malabon', 'Mandaluyong', 'Marikina', 'Muntinlupa', 'Navotas',
            'Parañaque', 'Pasay', 'Pasig', 'San Juan', 'Taguig', 'Valenzuela'
        ];

        $barangays = [
            'Barangay 1', 'Barangay 2', 'Barangay 3', 'San Antonio',
            'Santa Cruz', 'San Isidro', 'San Jose', 'Poblacion'
        ];

        $paymentMethods = ['cash', 'gcash', 'bank_transfer'];
        $locationIds = [1, 2];
        $employeeIds = [1, 2];
        $userId = 1;

        // Date range: November 1, 2024 to November 1, 2025
        $startDate = Carbon::create(2024, 11, 1);
        $endDate = Carbon::create(2025, 11, 1);

        // Create 150 customers
        echo "Creating customers...\n";
        $customers = [];
        for ($i = 0; $i < 150; $i++) {
            $customer = Customer::create([
                'first_name' => $firstNames[array_rand($firstNames)],
                'last_name' => $lastNames[array_rand($lastNames)],
                'address' => $barangays[array_rand($barangays)] . ', ' . $addresses[array_rand($addresses)],
                'phone_number' => '09' . rand(100000000, 999999999),
            ]);

            CustomerReference::create([
                'customer_id' => $customer->id,
                'full_name' => $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)],
                'phone_number' => '09' . rand(100000000, 999999999),
            ]);

            InvestigationDetail::create([
                'customer_id' => $customer->id,
                'employee_id' => $employeeIds[array_rand($employeeIds)],
                'home_visit_date' => $startDate->copy()->addDays(rand(0, 30)),
                'is_employment_verified' => rand(0, 1),
                'investigation_notes' => 'Customer verification completed. All documents checked.',
            ]);

            $customers[] = $customer;
        }

        echo "Creating installment orders...\n";
        
        // Get available items
        $availableItems = Item::whereNull('date_out')->get();
        
        if ($availableItems->count() < 500) {
            echo "Warning: Not enough items available. Only " . $availableItems->count() . " items found.\n";
        }

        $orderCounter = 0;
        $terms = [3, 6, 9, 12];

        // Distribution of order statuses
        // Active orders: 60% (300)
        // Completed orders: 20% (100)
        // Voided orders: 10% (50)
        // Defaulted orders: 10% (50)

        $statusDistribution = [
            'active' => 300,
            'completed' => 100,
            'voided' => 50,
            'defaulted' => 50,
        ];

        $currentItemIndex = 0;

        foreach ($statusDistribution as $status => $count) {
            echo "Creating {$count} {$status} orders...\n";
            
            for ($i = 0; $i < $count; $i++) {
                if ($currentItemIndex >= $availableItems->count()) {
                    echo "Ran out of available items at order " . ($orderCounter + 1) . "\n";
                    break 2;
                }

                $item = $availableItems[$currentItemIndex];
                $currentItemIndex++;

                $customer = $customers[array_rand($customers)];
                
                // Determine transaction date based on status
                if ($status === 'active') {
                    // Active orders: Spread across 12 months (Nov 2024 - Nov 2025)
                    $daysFromStart = rand(0, 365);
                    $transactionDate = $startDate->copy()->addDays($daysFromStart);
                } elseif ($status === 'completed') {
                    // Completed orders: Must be old enough to complete all payments
                    // If 12-month term, started at least 12 months ago
                    // Range: Nov 2024 to May 2025 (so 12-month terms can complete by Nov 2025)
                    $daysFromStart = rand(0, 180);
                    $transactionDate = $startDate->copy()->addDays($daysFromStart);
                } elseif ($status === 'voided') {
                    // Voided orders: Spread across the year
                    $daysFromStart = rand(0, 365);
                    $transactionDate = $startDate->copy()->addDays($daysFromStart);
                } else { // defaulted
                    // Defaulted orders: Started 3-10 months ago
                    $daysFromStart = rand(0, 240);
                    $transactionDate = $startDate->copy()->addDays($daysFromStart);
                }

                $selectedTerm = $terms[array_rand($terms)];
                
                // For completed orders, ensure enough time has passed to complete payments
                if ($status === 'completed') {
                    $maxDaysAgo = 365 - ($selectedTerm * 30);
                    if ($maxDaysAgo > 0) {
                        $daysFromStart = rand(0, min($maxDaysAgo, 180));
                        $transactionDate = $startDate->copy()->addDays($daysFromStart);
                    }
                }

                $noDownPayment = rand(0, 100) < 20; // 20% chance of no down payment

                // Calculate loan details
                $lcp = $this->calculateLCP($item->srp);
                $downPaymentPercent = $this->getDefaultDownPaymentPercent($item->item_type);
                $downPaymentAmount = $noDownPayment ? 0 : round($lcp * $downPaymentPercent);
                $pnv = $lcp - $downPaymentAmount;

                $interestConfig = $this->getInterestConfig($item->item_type, $selectedTerm);
                $multiplier = $interestConfig['multiplier'];
                $fixedCharge = $interestConfig['fixedCharge'];

                if ($noDownPayment) {
                    $finalPNV = round($lcp * 1.33 + 600);
                } else {
                    $finalPNV = round($pnv * $multiplier + $fixedCharge);
                }

                $monthlyPayment = round($finalPNV / $selectedTerm, 2);

                // Adjust last payment to account for rounding
                $totalScheduled = $monthlyPayment * $selectedTerm;
                $difference = $finalPNV - $totalScheduled;
                $lastPaymentAmount = $monthlyPayment + $difference;

                // Create order
                DB::beginTransaction();

                try {
                    $order = InstallmentOrder::create([
                        'customer_id' => $customer->id,
                        'location_id' => $locationIds[array_rand($locationIds)],
                        'user_id' => $userId,
                        'order_number' => $this->generateOrderNumber(),
                        'transaction_date' => $transactionDate,
                        'loan_contract_price' => $lcp,
                        'lcp_markup_rate' => 1.1,
                        'lcp_additional_charge' => 300,
                        'down_payment' => $downPaymentAmount,
                        'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                        'reference_number' => rand(0, 1) ? 'REF-' . rand(100000, 999999) : null,
                        'promisory_note_value' => $pnv,
                        'number_of_terms' => $selectedTerm,
                        'promisory_note_value_interest' => $multiplier,
                        'promisory_note_value_interest_additional_charge' => $fixedCharge,
                        'is_voided' => $status === 'voided',
                        'is_defaulted' => $status === 'defaulted',
                        'is_completed' => $status === 'completed',
                        'void_date' => $status === 'voided' ? $transactionDate->copy()->addDays(rand(1, 30)) : null,
                        'voider_id' => $status === 'voided' ? $userId : null,
                        'reason_for_cancellation' => $status === 'voided' ? 'Customer request - change of mind' : null,
                        'default_date' => $status === 'defaulted' ? $transactionDate->copy()->addMonths(rand(2, 4)) : null,
                        'defaulter_id' => $status === 'defaulted' ? $userId : null,
                        'default_reason' => $status === 'defaulted' ? 'Non-payment for consecutive months - unable to contact customer' : null,
                    ]);

                    InstallmentOrderItem::create([
                        'installment_order_id' => $order->id,
                        'item_id' => $item->id,
                        'serial' => $item->serial,
                        'sale_amount' => $finalPNV,
                    ]);

                    // FIXED: Only update date_out if order is NOT voided or defaulted
                    if ($status !== 'voided' && $status !== 'defaulted') {
                        $item->update(['date_out' => $transactionDate->toDateString()]);
                    }

                    // Create payment schedule with SEQUENTIAL payment logic
                    $allPaymentsPaid = true;
                    
                    for ($j = 1; $j <= $selectedTerm; $j++) {
                        $dueDate = Carbon::parse($transactionDate)->addMonths($j);
                        $paymentStatus = 'pending';
                        $amountPaid = 0;
                        $paidDate = null;
                        $paymentMethod = null;
                        $referenceNumber = null;
                        
                        // FIXED: Use correct monthly payment amount (last payment gets adjustment)
                        $currentMonthlyPayment = ($j === $selectedTerm) ? $lastPaymentAmount : $monthlyPayment;

                        if ($status === 'completed') {
                            // All payments are paid
                            $paymentStatus = 'paid';
                            $amountPaid = $currentMonthlyPayment;
                            $paidDate = $dueDate->copy()->subDays(rand(0, 5));
                            $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                            $referenceNumber = 'PAY-' . rand(100000, 999999);
                        } elseif ($status === 'active') {
                            // FIXED: Sequential payment logic - only pay if previous installments are paid
                            if ($allPaymentsPaid && $dueDate->isPast()) {
                                // 75% chance of being paid if past due date
                                if (rand(0, 100) < 75) {
                                    $paymentStatus = 'paid';
                                    $amountPaid = $currentMonthlyPayment;
                                    $paidDate = $dueDate->copy()->subDays(rand(0, 5));
                                    $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                                    $referenceNumber = 'PAY-' . rand(100000, 999999);
                                } else {
                                    // 15% chance of partial payment
                                    if (rand(0, 100) < 15) {
                                        $paymentStatus = 'partial';
                                        $amountPaid = round($currentMonthlyPayment * (rand(40, 80) / 100), 2);
                                        $paidDate = $dueDate->copy()->addDays(rand(1, 10));
                                        $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                                        $referenceNumber = 'PAY-' . rand(100000, 999999);
                                        $allPaymentsPaid = false; // Stop paying next installments
                                    } else {
                                        $paymentStatus = 'overdue';
                                        $allPaymentsPaid = false; // Stop paying next installments
                                    }
                                }
                            } elseif (!$allPaymentsPaid) {
                                // Previous payment not complete, this and following are pending/overdue
                                $paymentStatus = $dueDate->isPast() ? 'overdue' : 'pending';
                            }
                        } elseif ($status === 'defaulted') {
                            // FIXED: Sequential payment - First 1-2 payments are paid, rest become overdue
                            $paidInstallments = rand(1, 2);
                            if ($j <= $paidInstallments) {
                                $paymentStatus = 'paid';
                                $amountPaid = $currentMonthlyPayment;
                                $paidDate = $dueDate->copy()->subDays(rand(0, 5));
                                $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                                $referenceNumber = 'PAY-' . rand(100000, 999999);
                            } else {
                                $paymentStatus = 'overdue';
                            }
                        } elseif ($status === 'voided') {
                            // No payments for voided orders
                            $paymentStatus = 'pending';
                        }

                        $payment = InstallmentOrderPayment::create([
                            'installment_order_id' => $order->id,
                            'installment_number' => $j,
                            'amount_due' => $currentMonthlyPayment,
                            'amount_paid' => $amountPaid,
                            'due_date' => $dueDate,
                            'payment_method' => $paymentMethod,
                            'reference_number' => $referenceNumber,
                            'status' => $paymentStatus,
                            'paid_date' => $paidDate,
                        ]);

                        // Create payment history for paid/partial payments
                        if (in_array($paymentStatus, ['paid', 'partial'])) {
                            InstallmentOrderPaymentHistory::create([
                                'payment_id' => $payment->id,
                                'amount' => $amountPaid,
                                'payment_method' => $paymentMethod,
                                'reference_number' => $referenceNumber,
                                'paid_date' => $paidDate,
                                'user_id' => $userId,
                            ]);

                            // Some partial payments might have multiple payment attempts
                            if ($paymentStatus === 'partial' && rand(0, 100) < 30) {
                                $additionalAmount = round(($currentMonthlyPayment - $amountPaid) * (rand(30, 50) / 100), 2);
                                $additionalPaidDate = $paidDate->copy()->addDays(rand(5, 15));
                                
                                InstallmentOrderPaymentHistory::create([
                                    'payment_id' => $payment->id,
                                    'amount' => $additionalAmount,
                                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                                    'reference_number' => 'PAY-' . rand(100000, 999999),
                                    'paid_date' => $additionalPaidDate,
                                    'user_id' => $userId,
                                ]);
                                
                                // Update payment record
                                $newTotalPaid = $amountPaid + $additionalAmount;
                                $payment->update([
                                    'amount_paid' => $newTotalPaid,
                                    'status' => $newTotalPaid >= $currentMonthlyPayment ? 'paid' : 'partial'
                                ]);
                            }
                        }
                    }

                    // FIXED: Check if order should be marked as completed
                    // An order is completed only if ALL payments are fully paid
                    if ($status === 'active') {
                        $unpaidPayments = InstallmentOrderPayment::where('installment_order_id', $order->id)
                            ->whereIn('status', ['pending', 'partial', 'overdue'])
                            ->count();
                        
                        if ($unpaidPayments === 0) {
                            $order->update(['is_completed' => true]);
                        }
                    }

                    DB::commit();
                    $orderCounter++;

                    if ($orderCounter % 50 === 0) {
                        echo "Created {$orderCounter} orders...\n";
                    }

                } catch (\Exception $e) {
                    DB::rollBack();
                    echo "Error creating order: " . $e->getMessage() . "\n";
                    continue;
                }
            }
        }

        echo "Successfully created {$orderCounter} installment orders!\n";
    }
}