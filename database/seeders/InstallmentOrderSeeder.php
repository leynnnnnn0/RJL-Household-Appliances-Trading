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
        return 'IORD-' . date('Y') . '-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    }

    /**
     * Create orders with 30 days aging (last payment was 30-59 days ago)
     */
    private function get30DaysAging($count = 5)
    {
        $orders = [];
        for ($i = 0; $i < $count; $i++) {
            // Transaction started 3-6 months ago
            $transactionDate = Carbon::now()->subMonths(rand(3, 6));
            // Last payment due date was 30-59 days ago
            $lastPaymentDueDate = Carbon::now()->subDays(rand(30, 59));
            
            $orders[] = [
                'type' => '30_days_aging',
                'transactionDate' => $transactionDate,
                'status' => 'active',
                'specialConfig' => [
                    'lastPaymentDueDate' => $lastPaymentDueDate,
                    'hasOverduePayment' => true,
                ]
            ];
        }
        return $orders;
    }

    /**
     * Create orders with 60 days aging (last payment was 60-89 days ago)
     */
    private function get60DaysAging($count = 5)
    {
        $orders = [];
        for ($i = 0; $i < $count; $i++) {
            $transactionDate = Carbon::now()->subMonths(rand(4, 8));
            $lastPaymentDueDate = Carbon::now()->subDays(rand(60, 89));
            
            $orders[] = [
                'type' => '60_days_aging',
                'transactionDate' => $transactionDate,
                'status' => 'active',
                'specialConfig' => [
                    'lastPaymentDueDate' => $lastPaymentDueDate,
                    'hasOverduePayment' => true,
                ]
            ];
        }
        return $orders;
    }

    /**
     * Create orders with 90+ days aging (last payment was 90+ days ago)
     */
    private function get90DaysAging($count = 5)
    {
        $orders = [];
        for ($i = 0; $i < $count; $i++) {
            $transactionDate = Carbon::now()->subMonths(rand(6, 12));
            $lastPaymentDueDate = Carbon::now()->subDays(rand(90, 180));
            
            $orders[] = [
                'type' => '90_days_aging',
                'transactionDate' => $transactionDate,
                'status' => 'active',
                'specialConfig' => [
                    'lastPaymentDueDate' => $lastPaymentDueDate,
                    'hasOverduePayment' => true,
                ]
            ];
        }
        return $orders;
    }

    /**
     * Create orders with due loans (payment is due within 7 days)
     */
    private function getDueLoans($count = 5)
    {
        $orders = [];
        for ($i = 0; $i < $count; $i++) {
            // Calculate how many months ago to start so next payment is due within 7 days
            // We want a payment to be due between today and 7 days from now
            $daysUntilDue = rand(1, 7);
            
            // We need to figure out which installment number will have this due date
            // Let's say we want installment 2, 3, or 4 to be the "due soon" one
            $targetInstallment = rand(2, 4);
            
            // If installment 3 is due in 5 days, transaction was 3 months ago minus 5 days
            $transactionDate = Carbon::now()->subMonths($targetInstallment)->addDays($daysUntilDue);
            
            $orders[] = [
                'type' => 'due_loans',
                'transactionDate' => $transactionDate,
                'status' => 'active',
                'specialConfig' => [
                    'targetInstallment' => $targetInstallment,
                    'daysUntilDue' => $daysUntilDue,
                    'hasDuePayment' => true,
                ]
            ];
        }
        return $orders;
    }

    /**
     * Create orders with missed repayments (at least 1 overdue payment)
     */
    private function getMissedRepayments($count = 5)
    {
        $orders = [];
        for ($i = 0; $i < $count; $i++) {
            $transactionDate = Carbon::now()->subMonths(rand(2, 6));
            $missedPaymentDueDate = Carbon::now()->subDays(rand(5, 30));
            
            $orders[] = [
                'type' => 'missed_repayments',
                'transactionDate' => $transactionDate,
                'status' => 'active',
                'specialConfig' => [
                    'missedPaymentDueDate' => $missedPaymentDueDate,
                    'hasMissedPayment' => true,
                ]
            ];
        }
        return $orders;
    }

    /**
     * Create orders with loans in arrears (2+ consecutive missed payments)
     */
    private function getLoansInArrears($count = 5)
    {
        $orders = [];
        for ($i = 0; $i < $count; $i++) {
            $transactionDate = Carbon::now()->subMonths(rand(3, 8));
            $firstMissedPaymentDate = Carbon::now()->subDays(rand(60, 120));
            
            $orders[] = [
                'type' => 'loans_in_arrears',
                'transactionDate' => $transactionDate,
                'status' => 'active',
                'specialConfig' => [
                    'firstMissedPaymentDate' => $firstMissedPaymentDate,
                    'consecutiveMissedPayments' => rand(2, 4),
                ]
            ];
        }
        return $orders;
    }

    /**
     * Create orders with no repayments (no payment made at all)
     */
    private function getNoRepayments($count = 5)
    {
        $orders = [];
        for ($i = 0; $i < $count; $i++) {
            $transactionDate = Carbon::now()->subMonths(rand(1, 4));
            
            $orders[] = [
                'type' => 'no_repayments',
                'transactionDate' => $transactionDate,
                'status' => 'active',
                'specialConfig' => [
                    'noPaymentsMade' => true,
                ]
            ];
        }
        return $orders;
    }

    /**
     * Create orders past maturity dates (final payment date has passed)
     */
    private function getPastMaturity($count = 5)
    {
        $orders = [];
        for ($i = 0; $i < $count; $i++) {
            // Order started long enough ago that all payments should be done
            $transactionDate = Carbon::now()->subMonths(rand(13, 18));
            $finalPaymentDueDate = Carbon::now()->subDays(rand(30, 90));
            
            $orders[] = [
                'type' => 'past_maturity',
                'transactionDate' => $transactionDate,
                'status' => 'active',
                'specialConfig' => [
                    'finalPaymentDueDate' => $finalPaymentDueDate,
                    'pastMaturity' => true,
                ]
            ];
        }
        return $orders;
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
        
        $availableItems = Item::whereNull('date_out')->get();
        
        if ($availableItems->count() < 500) {
            echo "Warning: Not enough items available. Only " . $availableItems->count() . " items found.\n";
        }

        $orderCounter = 0;
        $terms = [3, 6, 9, 12];

        // Get special advanced filter orders (5 each)
        $specialOrders = array_merge(
            $this->get30DaysAging(5),
            $this->get60DaysAging(5),
            $this->get90DaysAging(5),
            $this->getDueLoans(5),
            $this->getMissedRepayments(5),
            $this->getLoansInArrears(5),
            $this->getNoRepayments(5),
            $this->getPastMaturity(5)
        );

        // Regular distribution (adjusted counts to account for special orders)
        $statusDistribution = [
            'active' => 260,      // 300 - 40 (special orders are active)
            'completed' => 100,
            'voided' => 50,
            'defaulted' => 50,
        ];

        $currentItemIndex = 0;

        // Create special advanced filter orders first
        echo "Creating special advanced filter orders (40 total)...\n";
        foreach ($specialOrders as $specialOrder) {
            if ($currentItemIndex >= $availableItems->count()) {
                echo "Ran out of available items\n";
                break;
            }

            $item = $availableItems[$currentItemIndex];
            $currentItemIndex++;

            $customer = $customers[array_rand($customers)];
            $transactionDate = $specialOrder['transactionDate'];
            $selectedTerm = $terms[array_rand($terms)];
            
            $noDownPayment = rand(0, 100) < 20;

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
            $totalScheduled = $monthlyPayment * $selectedTerm;
            $difference = $finalPNV - $totalScheduled;
            $lastPaymentAmount = $monthlyPayment + $difference;

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
                    'is_voided' => false,
                    'is_defaulted' => false,
                    'is_completed' => false,
                    'created_at' => $transactionDate,
                    'updated_at' => $transactionDate,
                ]);

                InstallmentOrderItem::create([
                    'installment_order_id' => $order->id,
                    'item_id' => $item->id,
                    'serial' => $item->serial,
                    'sale_amount' => $finalPNV,
                ]);

                $item->update(['date_out' => $transactionDate->toDateString()]);

                // Create payment schedule based on special order type
                // IMPORTANT: All payments must be SEQUENTIAL - you can't pay installment 3 if installment 2 isn't paid
                $config = $specialOrder['specialConfig'];
                $allPaymentsPaid = true; // Track if all previous payments are paid
                
                for ($j = 1; $j <= $selectedTerm; $j++) {
                    $dueDate = Carbon::parse($transactionDate)->addMonths($j);
                    $currentMonthlyPayment = ($j === $selectedTerm) ? $lastPaymentAmount : $monthlyPayment;
                    
                    $paymentStatus = 'pending';
                    $amountPaid = 0;
                    $paidDate = null;
                    $paymentMethod = null;
                    $referenceNumber = null;

                    // Handle special payment patterns - ALWAYS SEQUENTIAL
                    if (isset($config['noPaymentsMade']) && $config['noPaymentsMade']) {
                        // No payments at all - all installments are unpaid
                        $paymentStatus = $dueDate->isPast() ? 'overdue' : 'pending';
                        $allPaymentsPaid = false;
                        
                    } elseif (isset($config['consecutiveMissedPayments'])) {
                        // Loans in arrears - pay first N installments sequentially, then stop
                        $paidCount = $selectedTerm - $config['consecutiveMissedPayments'];
                        
                        if ($j <= $paidCount && $allPaymentsPaid) {
                            // Pay this installment only if previous ones are paid
                            $paymentStatus = 'paid';
                            $amountPaid = $currentMonthlyPayment;
                            $paidDate = $dueDate->copy()->subDays(rand(0, 3));
                            $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                            $referenceNumber = 'PAY-' . rand(100000, 999999);
                        } else {
                            // Once we stop paying, all following installments are overdue
                            $paymentStatus = 'overdue';
                            $allPaymentsPaid = false;
                        }
                        
                    } elseif (isset($config['hasMissedPayment'])) {
                        // Missed repayments - pay sequentially until we hit the first missed payment
                        if ($allPaymentsPaid && $dueDate->isPast()) {
                            // 60% chance of paying (meaning 40% chance of first missed payment)
                            if (rand(0, 100) < 60) {
                                $paymentStatus = 'paid';
                                $amountPaid = $currentMonthlyPayment;
                                $paidDate = $dueDate->copy()->subDays(rand(0, 5));
                                $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                                $referenceNumber = 'PAY-' . rand(100000, 999999);
                            } else {
                                // First missed payment - stop paying future installments
                                $paymentStatus = 'overdue';
                                $allPaymentsPaid = false;
                            }
                        } elseif (!$allPaymentsPaid) {
                            // Previous payment was missed, so this and all future are pending/overdue
                            $paymentStatus = $dueDate->isPast() ? 'overdue' : 'pending';
                        }
                        
                    } elseif (isset($config['pastMaturity'])) {
                        // Past maturity - paid sequentially until a certain point, then all remaining overdue
                        $paidInstallments = rand(max(1, $selectedTerm - 3), $selectedTerm - 1);
                        
                        if ($j <= $paidInstallments && $allPaymentsPaid) {
                            $paymentStatus = 'paid';
                            $amountPaid = $currentMonthlyPayment;
                            $paidDate = $dueDate->copy()->subDays(rand(0, 3));
                            $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                            $referenceNumber = 'PAY-' . rand(100000, 999999);
                        } else {
                            $paymentStatus = 'overdue';
                            $allPaymentsPaid = false;
                        }
                        
                    } elseif (isset($config['hasOverduePayment'])) {
                        // Aging orders - pay all installments sequentially up to the last paid date, then stop
                        if ($allPaymentsPaid && $dueDate->lessThan($config['lastPaymentDueDate'])) {
                            $paymentStatus = 'paid';
                            $amountPaid = $currentMonthlyPayment;
                            $paidDate = $dueDate->copy()->subDays(rand(0, 3));
                            $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                            $referenceNumber = 'PAY-' . rand(100000, 999999);
                        } else {
                            // Once we reach the overdue payment, all following are also overdue
                            $paymentStatus = 'overdue';
                            $allPaymentsPaid = false;
                        }
                        
                    } elseif (isset($config['hasDuePayment'])) {
                        // Due loans - pay all past installments sequentially, upcoming ones are pending
                        if ($allPaymentsPaid && $dueDate->isPast()) {
                            $paymentStatus = 'paid';
                            $amountPaid = $currentMonthlyPayment;
                            $paidDate = $dueDate->copy()->subDays(rand(0, 3));
                            $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                            $referenceNumber = 'PAY-' . rand(100000, 999999);
                        } elseif (!$allPaymentsPaid) {
                            // If previous payment failed, this becomes overdue or pending
                            $paymentStatus = $dueDate->isPast() ? 'overdue' : 'pending';
                        } else {
                            // Future payment - pending
                            $paymentStatus = 'pending';
                        }
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
                        'created_at' => $transactionDate,
                        'updated_at' => $paidDate ?? $transactionDate,
                    ]);

                    if (in_array($paymentStatus, ['paid', 'partial'])) {
                        InstallmentOrderPaymentHistory::create([
                            'payment_id' => $payment->id,
                            'amount' => $amountPaid,
                            'payment_method' => $paymentMethod,
                            'reference_number' => $referenceNumber,
                            'paid_date' => $paidDate,
                            'user_id' => $userId,
                            'created_at' => $paidDate,
                            'updated_at' => $paidDate,
                        ]);
                    }
                }

                DB::commit();
                $orderCounter++;

                if ($orderCounter % 10 === 0) {
                    echo "Created {$orderCounter} special orders...\n";
                }

            } catch (\Exception $e) {
                DB::rollBack();
                echo "Error creating special order: " . $e->getMessage() . "\n";
                continue;
            }
        }

        // Create regular orders
        // foreach ($statusDistribution as $status => $count) {
        //     echo "Creating {$count} {$status} orders...\n";
            
        //     for ($i = 0; $i < $count; $i++) {
        //         if ($currentItemIndex >= $availableItems->count()) {
        //             echo "Ran out of available items at order " . ($orderCounter + 1) . "\n";
        //             break 2;
        //         }

        //         $item = $availableItems[$currentItemIndex];
        //         $currentItemIndex++;

        //         $customer = $customers[array_rand($customers)];
                
        //         if ($status === 'active') {
        //             $daysFromStart = rand(0, 365);
        //             $transactionDate = $startDate->copy()->addDays($daysFromStart);
        //         } elseif ($status === 'completed') {
        //             $daysFromStart = rand(0, 180);
        //             $transactionDate = $startDate->copy()->addDays($daysFromStart);
        //         } elseif ($status === 'voided') {
        //             $daysFromStart = rand(0, 365);
        //             $transactionDate = $startDate->copy()->addDays($daysFromStart);
        //         } else {
        //             $daysFromStart = rand(0, 240);
        //             $transactionDate = $startDate->copy()->addDays($daysFromStart);
        //         }

        //         $selectedTerm = $terms[array_rand($terms)];
                
        //         if ($status === 'completed') {
        //             $maxDaysAgo = 365 - ($selectedTerm * 30);
        //             if ($maxDaysAgo > 0) {
        //                 $daysFromStart = rand(0, min($maxDaysAgo, 180));
        //                 $transactionDate = $startDate->copy()->addDays($daysFromStart);
        //             }
        //         }

        //         $noDownPayment = rand(0, 100) < 20;

        //         $lcp = $this->calculateLCP($item->srp);
        //         $downPaymentPercent = $this->getDefaultDownPaymentPercent($item->item_type);
        //         $downPaymentAmount = $noDownPayment ? 0 : round($lcp * $downPaymentPercent);
        //         $pnv = $lcp - $downPaymentAmount;

        //         $interestConfig = $this->getInterestConfig($item->item_type, $selectedTerm);
        //         $multiplier = $interestConfig['multiplier'];
        //         $fixedCharge = $interestConfig['fixedCharge'];

        //         if ($noDownPayment) {
        //             $finalPNV = round($lcp * 1.33 + 600);
        //         } else {
        //             $finalPNV = round($pnv * $multiplier + $fixedCharge);
        //         }

        //         $monthlyPayment = round($finalPNV / $selectedTerm, 2);
        //         $totalScheduled = $monthlyPayment * $selectedTerm;
        //         $difference = $finalPNV - $totalScheduled;
        //         $lastPaymentAmount = $monthlyPayment + $difference;

        //         DB::beginTransaction();

        //         try {
        //             $order = InstallmentOrder::create([
        //                 'customer_id' => $customer->id,
        //                 'location_id' => $locationIds[array_rand($locationIds)],
        //                 'user_id' => $userId,
        //                 'order_number' => $this->generateOrderNumber(),
        //                 'transaction_date' => $transactionDate,
        //                 'loan_contract_price' => $lcp,
        //                 'lcp_markup_rate' => 1.1,
        //                 'lcp_additional_charge' => 300,
        //                 'down_payment' => $downPaymentAmount,
        //                 'payment_method' => $paymentMethods[array_rand($paymentMethods)],
        //                 'reference_number' => rand(0, 1) ? 'REF-' . rand(100000, 999999) : null,
        //                 'promisory_note_value' => $pnv,
        //                 'number_of_terms' => $selectedTerm,
        //                 'promisory_note_value_interest' => $multiplier,
        //                 'promisory_note_value_interest_additional_charge' => $fixedCharge,
        //                 'is_voided' => $status === 'voided',
        //                 'is_defaulted' => $status === 'defaulted',
        //                 'is_completed' => $status === 'completed',
        //                 'void_date' => $status === 'voided' ? $transactionDate->copy()->addDays(rand(1, 30)) : null,
        //                 'voider_id' => $status === 'voided' ? $userId : null,
        //                 'reason_for_cancellation' => $status === 'voided' ? 'Customer request - change of mind' : null,
        //                 'default_date' => $status === 'defaulted' ? $transactionDate->copy()->addMonths(rand(2, 4)) : null,
        //                 'defaulter_id' => $status === 'defaulted' ? $userId : null,
        //                 'default_reason' => $status === 'defaulted' ? 'Non-payment for consecutive months - unable to contact customer' : null,
        //                 'created_at' => $transactionDate,
        //                 'updated_at' => $transactionDate,
        //             ]);

        //             InstallmentOrderItem::create([
        //                 'installment_order_id' => $order->id,
        //                 'item_id' => $item->id,
        //                 'serial' => $item->serial,
        //                 'sale_amount' => $finalPNV,
        //             ]);

        //             if ($status !== 'voided' && $status !== 'defaulted') {
        //                 $item->update(['date_out' => $transactionDate->toDateString()]);
        //             }

        //             $allPaymentsPaid = true;
                    
        //             for ($j = 1; $j <= $selectedTerm; $j++) {
        //                 $dueDate = Carbon::parse($transactionDate)->addMonths($j);
        //                 $paymentStatus = 'pending';
        //                 $amountPaid = 0;
        //                 $paidDate = null;
        //                 $paymentMethod = null;
        //                 $referenceNumber = null;
                        
        //                 $currentMonthlyPayment = ($j === $selectedTerm) ? $lastPaymentAmount : $monthlyPayment;

        //                 if ($status === 'completed') {
        //                     $paymentStatus = 'paid';
        //                     $amountPaid = $currentMonthlyPayment;
        //                     $paidDate = $dueDate->copy()->subDays(rand(0, 5));
        //                     $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
        //                     $referenceNumber = 'PAY-' . rand(100000, 999999);
        //                 } elseif ($status === 'active') {
        //                     if ($allPaymentsPaid && $dueDate->isPast()) {
        //                         if (rand(0, 100) < 75) {
        //                             $paymentStatus = 'paid';
        //                             $amountPaid = $currentMonthlyPayment;
        //                             $paidDate = $dueDate->copy()->subDays(rand(0, 5));
        //                             $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
        //                             $referenceNumber = 'PAY-' . rand(100000, 999999);
        //                         } else {
        //                             if (rand(0, 100) < 15) {
        //                                 $paymentStatus = 'partial';
        //                                 $amountPaid = round($currentMonthlyPayment * (rand(40, 80) / 100), 2);
        //                                 $paidDate = $dueDate->copy()->addDays(rand(1, 10));
        //                                 $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
        //                                 $referenceNumber = 'PAY-' . rand(100000, 999999);
        //                                 $allPaymentsPaid = false;
        //                             } else {
        //                                 $paymentStatus = 'overdue';
        //                                 $allPaymentsPaid = false;
        //                             }
        //                         }
        //                     } elseif (!$allPaymentsPaid) {
        //                         $paymentStatus = $dueDate->isPast() ? 'overdue' : 'pending';
        //                     }
        //                 } elseif ($status === 'defaulted') {
        //                     $paidInstallments = rand(1, 2);
        //                     if ($j <= $paidInstallments) {
        //                         $paymentStatus = 'paid';
        //                         $amountPaid = $currentMonthlyPayment;
        //                         $paidDate = $dueDate->copy()->subDays(rand(0, 5));
        //                         $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
        //                         $referenceNumber = 'PAY-' . rand(100000, 999999);
        //                     } else {
        //                         $paymentStatus = 'overdue';
        //                     }
        //                 } elseif ($status === 'voided') {
        //                     $paymentStatus = 'pending';
        //                 }

        //                 $payment = InstallmentOrderPayment::create([
        //                     'installment_order_id' => $order->id,
        //                     'installment_number' => $j,
        //                     'amount_due' => $currentMonthlyPayment,
        //                     'amount_paid' => $amountPaid,
        //                     'due_date' => $dueDate,
        //                     'payment_method' => $paymentMethod,
        //                     'reference_number' => $referenceNumber,
        //                     'status' => $paymentStatus,
        //                     'paid_date' => $paidDate,
        //                     'created_at' => $transactionDate,
        //                     'updated_at' => $paidDate ?? $transactionDate,
        //                 ]);

        //                 if (in_array($paymentStatus, ['paid', 'partial'])) {
        //                     InstallmentOrderPaymentHistory::create([
        //                         'payment_id' => $payment->id,
        //                         'amount' => $amountPaid,
        //                         'payment_method' => $paymentMethod,
        //                         'reference_number' => $referenceNumber,
        //                         'paid_date' => $paidDate,
        //                         'user_id' => $userId,
        //                         'created_at' => $paidDate,
        //                         'updated_at' => $paidDate,
        //                     ]);

        //                     if ($paymentStatus === 'partial' && rand(0, 100) < 30) {
        //                         $additionalAmount = round(($currentMonthlyPayment - $amountPaid) * (rand(30, 50) / 100), 2);
        //                         $additionalPaidDate = $paidDate->copy()->addDays(rand(5, 15));
                                
        //                         InstallmentOrderPaymentHistory::create([
        //                             'payment_id' => $payment->id,
        //                             'amount' => $additionalAmount,
        //                             'payment_method' => $paymentMethods[array_rand($paymentMethods)],
        //                             'reference_number' => 'PAY-' . rand(100000, 999999),
        //                             'paid_date' => $additionalPaidDate,
        //                             'user_id' => $userId,
        //                             'created_at' => $additionalPaidDate,
        //                             'updated_at' => $additionalPaidDate,
        //                         ]);
                                
        //                         $newTotalPaid = $amountPaid + $additionalAmount;
        //                         $payment->update([
        //                             'amount_paid' => $newTotalPaid,
        //                             'status' => $newTotalPaid >= $currentMonthlyPayment ? 'paid' : 'partial'
        //                         ]);
        //                     }
        //                 }
        //             }

        //             if ($status === 'active') {
        //                 $unpaidPayments = InstallmentOrderPayment::where('installment_order_id', $order->id)
        //                     ->whereIn('status', ['pending', 'partial', 'overdue'])
        //                     ->count();
                        
        //                 if ($unpaidPayments === 0) {
        //                     $order->update(['is_completed' => true]);
        //                 }
        //             }

        //             DB::commit();
        //             $orderCounter++;

        //             if ($orderCounter % 50 === 0) {
        //                 echo "Created {$orderCounter} orders...\n";
        //             }

        //         } catch (\Exception $e) {
        //             DB::rollBack();
        //             echo "Error creating order: " . $e->getMessage() . "\n";
        //             continue;
        //         }
        //     }
        // }

        echo "Successfully created {$orderCounter} installment orders!\n";
        echo "Including 40 special advanced filter orders (5 each of 8 types)\n";
    }
}