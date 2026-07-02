<?php

namespace App\Services\POSCredit;

class POSCreditCalculator
{
    private const NO_DOWN_PAYMENT_MULTIPLIER = 1.33;

    private const NO_DOWN_PAYMENT_FIXED_CHARGE = 600;

    public function calculate(array $data): array
    {
        $lcp = $this->loanContractPrice($data);
        $downPayment = $this->downPayment($data);
        $pnv = $lcp - $downPayment;
        $interestMultiplier = $this->interestMultiplier($data);
        $interestAdditionalCharge = $this->interestAdditionalCharge($data);

        return [
            'loan_contract_price' => $this->money($lcp),
            'lcp_markup_rate' => $this->lcpMarkupRate($data),
            'lcp_additional_charge' => $this->lcpAdditionalCharge($data),
            'down_payment' => $this->money($downPayment),
            'promisory_note_value' => $this->money($pnv),
            'promisory_note_value_interest' => $interestMultiplier,
            'promisory_note_value_interest_additional_charge' => $this->money($interestAdditionalCharge),
            'installment_total' => $this->money($this->installmentTotal($pnv, $interestMultiplier, $interestAdditionalCharge)),
        ];
    }

    private function loanContractPrice(array $data): float
    {
        $itemTotal = $this->itemTotal($data);

        if ($this->isNoInterest($data)) {
            return $itemTotal;
        }

        return ($itemTotal * $this->lcpMarkupRate($data)) + $this->lcpAdditionalCharge($data);
    }

    private function downPayment(array $data): float
    {
        if ($this->isNoDownPayment($data)) {
            return 0;
        }

        return (float) ($data['down_payment'] ?? 0);
    }

    private function interestMultiplier(array $data): float
    {
        if ($this->isNoInterest($data)) {
            return 1;
        }

        if ($this->isNoDownPayment($data)) {
            return self::NO_DOWN_PAYMENT_MULTIPLIER;
        }

        return (float) ($data['promisory_note_value_interest'] ?? 1);
    }

    private function interestAdditionalCharge(array $data): float
    {
        if ($this->isNoInterest($data)) {
            return 0;
        }

        if ($this->isNoDownPayment($data)) {
            return self::NO_DOWN_PAYMENT_FIXED_CHARGE;
        }

        return (float) ($data['promisory_note_value_interest_additional_charge'] ?? 0);
    }

    private function installmentTotal(float $pnv, float $interestMultiplier, float $interestAdditionalCharge): float
    {
        return ($pnv * $interestMultiplier) + $interestAdditionalCharge;
    }

    private function itemTotal(array $data): float
    {
        return collect($data['items'] ?? [])->sum(fn (array $item) => (float) ($item['srp'] ?? 0));
    }

    private function lcpMarkupRate(array $data): float
    {
        return $this->isNoInterest($data) ? 0 : (float) ($data['lcp_markup_rate'] ?? 1);
    }

    private function lcpAdditionalCharge(array $data): float
    {
        return $this->isNoInterest($data) ? 0 : (float) ($data['lcp_additional_charge'] ?? 0);
    }

    private function isNoInterest(array $data): bool
    {
        return filter_var($data['is_no_interest'] ?? false, FILTER_VALIDATE_BOOLEAN);
    }

    private function isNoDownPayment(array $data): bool
    {
        return filter_var($data['is_no_down_payment'] ?? false, FILTER_VALIDATE_BOOLEAN);
    }

    private function money(float $amount): float
    {
        return round($amount, 2);
    }
}
