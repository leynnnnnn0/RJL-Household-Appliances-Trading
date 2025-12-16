<?php

namespace App\Models;

use App\Http\Controllers\InstallmentOrderRemark;
use App\Models\InstallmentOrderRemark as ModelsInstallmentOrderRemark;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstallmentOrder extends Model
{
    /** @use HasFactory<\Database\Factories\InstallmentOrderFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'location_id',
        'user_id',
        'order_number',
        'loan_contract_price',
        'lcp_markup_rate',
        'lcp_additional_charge',
        'down_payment',
        'payment_method',
        'reference_number',
        'receipt_number',

        'promisory_note_value',
        'number_of_terms',
        'promisory_note_value_interest',
        'promisory_note_value_interest_additional_charge',
        'transaction_date',

        'is_voided',
        'reason_for_cancellation',
        'void_date',
        'voider_id',

        'is_completed',

        'is_accelerated',
        'reason_for_acceleration',
        'acceleration_discount',
        'acceleration_date',

        'is_defaulted',
        'default_reason',
        'default_date',
        'defaulter_id',

          'is_reactivated',
        'reactivation_reason',
        'reactivation_date',
        'reactivator_id'
    ];

    protected $appends = [
        'total_amount_paid',
        'remaining_balance',
        'total_pnv',
        'monthly_payment',
        'total_advanced_payment',
        'total_rebate_amount'
    ];

    public function getMonthlyPaymentAttribute()
    {
        return $this->total_pnv / $this->number_of_terms;
    }

    public function getTotalRebateAmountAttribute()
    {
        $data = $this->installment_order_payments;
        $total = $data->count() > 0 ? $data->sum('rebate_amount') : 0;
        return $total;
    }

    public function getTotalAmountPaidAttribute()
    {
        $data = $this->installment_order_payments
            ->flatMap(function ($payment) {
                return $payment->installment_order_payment_history;
            });

        $total = $data->count() > 0 ? $data->sum('amount') : 0;
        return $total;
    }

    public function getTotalAdvancedPaymentAttribute()
    {
        $dates = $this->getNextDueDate($this->transaction_date);
        $previousDue = $dates['previous_due'];

        return $this->installment_order_payments
            ->filter(function ($transaction) use ($previousDue) {
                $dueDate = Carbon::parse($transaction->due_date);
                $paidDate = Carbon::parse($transaction->paid_date);
                $status = $transaction->status;
                if ($status != 'paid' && $status != 'partial') return;
               
                return $transaction->amount_due > 0 && $paidDate->lt($dueDate) && $dueDate->gt($previousDue);
            })
            ->sum('amount_paid');

    }


    public function getNextDueDate($transactionDate)
    {
        $transactionDate = Carbon::parse($transactionDate);
        $today = Carbon::today(); // or use Carbon::today() in production
        $targetDay = $transactionDate->day;

        // candidate date in the current month (adjust if month is shorter)
        $daysInThisMonth = Carbon::create($today->year, $today->month, 1)->daysInMonth;
        $candidate = Carbon::create($today->year, $today->month, min($targetDay, $daysInThisMonth));

        if ($candidate->lte($today)) {
            // next due is next month (adjust for month length)
            $nextMonth = $candidate->copy()->addMonth();
            $daysInNextMonth = Carbon::create($nextMonth->year, $nextMonth->month, 1)->daysInMonth;
            $dueDate = Carbon::create($nextMonth->year, $nextMonth->month, min($targetDay, $daysInNextMonth));

            // previous due is this month's candidate (most recent)
            $previousDue = $candidate->copy();
        } else {
            // next due is still this month
            $dueDate = $candidate;

            // previous due is last month's same day (adjust for month length)
            $previousMonth = $candidate->copy()->subMonth();
            $daysInPrevMonth = Carbon::create($previousMonth->year, $previousMonth->month, 1)->daysInMonth;
            $previousDue = Carbon::create($previousMonth->year, $previousMonth->month, min($targetDay, $daysInPrevMonth));
        }

        return [
            'due_date'      => $dueDate->format('Y-m-d'),
            'previous_due'  => $previousDue->format('Y-m-d'),
        ];
    }

    public function getTotalPNVAttribute()
    {
        $noteValue = floatval($this->promisory_note_value);
        $interest = floatval($this->promisory_note_value_interest);
        $additional = floatval($this->promisory_note_value_interest_additional_charge);

        return $noteValue * $interest + $additional;
    }

    public function getRemainingBalanceAttribute()
    {
        $noteValue = floatval($this->promisory_note_value);
        $interest = floatval($this->promisory_note_value_interest);
        $additional = floatval($this->promisory_note_value_interest_additional_charge);
        $paid = floatval($this->getTotalAmountPaidAttribute());

        $totalToPay = ($noteValue * $interest) + $additional;

        return $totalToPay - $paid - $this->acceleration_discount;
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function voider()
    {
        return $this->belongsTo(User::class);
    }

    public function installment_order_item()
    {
        return $this->hasOne(InstallmentOrderItem::class);
    }

    public function installment_order_payments()
    {
        return $this->hasMany(InstallmentOrderPayment::class);
    }

    public function remarks()
    {
        return $this->hasMany(ModelsInstallmentOrderRemark::class);
    }
}
