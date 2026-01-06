<?php

namespace App\Http\Controllers;

use App\Models\InstallmentOrder;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class PDFController extends Controller
{
    public function index()
    {
        // Fake data for testing
        $data = [
            'mobileNumber' => '09506122101',
            'date' => 'NOV. 09, 2025',
            'referenceNumber' => 'REAL ME C71 6/128 W/SIM',
            'customerName' => 'CRUZ LESTER/ CRUZ LOLITO',
            'remainingMonths' => '9',
            'dueDay' => '9TH',
            'monthlyInstallment' => 'P 925.00',
            'managerName' => 'JAYSON MANALILI',
            'customerNameCopy' => 'CRUZ LESTER/ CRUZ LOLITO.',
        ];

        return view('pdf.installment-contract', $data);
    }

    public function installmentContract($id)
    {
        $order = InstallmentOrder::with(['customer', 'installment_order_items.item'])->findOrFail($id);
        $dueDay = Carbon::parse($order->transaction_date)->format('jS');


        $formatter = new \NumberFormatter('en', \NumberFormatter::SPELLOUT);

        // round the value to 2 decimals
        $amount = round($order->monthly_payment, 2);

        $words = strtoupper($formatter->format($amount));



        $data = [
            'mobileNumber' => '09506122101',
            'date' => Carbon::now()->format('F d, Y'),
            'referenceNumber' => $order->installment_order_items->map(fn($item) => $item->item->model)
                            ->implode(', '),
            'customerName' => strtoupper($order->customer->full_name),
            'remainingMonths' => $order->number_of_terms,
            'dueDay' => $dueDay,
            'monthlyInstallment' => round($order->monthly_payment, 2),
            'managerName' => 'JAYSON MANALILI',
            'customerNameCopy' => 'CRUZ LESTER/ CRUZ LOLITO.',
        ];

        $pdf = Pdf::loadView('pdf.installment-contract', $data);

        return $pdf->stream('installment-contract.pdf');
    }

    public function download()
    {
        // Fake data for testing
        $data = [
            'mobileNumber' => '09506122101',
            'date' => 'NOV. 09, 2025',
            'referenceNumber' => 'REAL ME C71 6/128 W/SIM',
            'customerName' => 'CRUZ LESTER/ CRUZ LOLITO',
            'remainingMonths' => '9',
            'dueDay' => '9TH',
            'monthlyInstallment' => 'P 925.00',
            'managerName' => 'JAYSON MANALILI',
            'customerNameCopy' => 'CRUZ LESTER/ CRUZ LOLITO.',
        ];

        $pdf = Pdf::loadView('pdf.installment-contract', $data);

        return $pdf->download('installment-contract.pdf');
    }

    public function stream()
    {
        // Fake data for testing
        $data = [
            'mobileNumber' => '09506122101',
            'date' => 'NOV. 09, 2025',
            'referenceNumber' => 'REAL ME C71 6/128 W/SIM',
            'customerName' => 'CRUZ LESTER/ CRUZ LOLITO',
            'remainingMonths' => '9',
            'dueDay' => '9TH',
            'monthlyInstallment' => 'P 925.00',
            'managerName' => 'JAYSON MANALILI',
            'customerNameCopy' => 'CRUZ LESTER/ CRUZ LOLITO.',
        ];

        $pdf = Pdf::loadView('pdf.installment-contract', $data);

        return $pdf->stream('installment-contract.pdf');
    }

    public function depositAgreement()
    {
        // Fake data for deposit agreement
        $data = [
            'contactNumbers' => '09267788685/09187491613',
            'date' => 'NOV. 10, 2025',
            'customerAddress' => 'Brgy. San Juan, Bataan',
            'customerAddress2' => 'Orani, Bataan 2112',
            'brand' => 'Samsung',
            'model' => 'Galaxy S23',
            'serialNumber' => 'SN123456789ABC',
            'color' => 'Phantom Black',
            'daysToRedeem' => '30',
            'paymentSchedule' => [
                [
                    'due_date' => 'Dec 09, 2025',
                    'principal' => 'P 850.00',
                    'interest' => 'P 75.00',
                    'total' => 'P 925.00',
                    'payment_dates' => '',
                ],
                [
                    'due_date' => 'Jan 09, 2026',
                    'principal' => 'P 850.00',
                    'interest' => 'P 75.00',
                    'total' => 'P 925.00',
                    'payment_dates' => '',
                ],
                [
                    'due_date' => 'Feb 09, 2026',
                    'principal' => 'P 850.00',
                    'interest' => 'P 75.00',
                    'total' => 'P 925.00',
                    'payment_dates' => '',
                ],
            ],
            'customerName' => 'CRUZ LESTER',
        ];


        $pdf = Pdf::loadView('pdf.deposit-agreement', $data);

        return $pdf->stream('deposit-agreement.pdf');
    }

    public function demandLetter()
    {
        // Fake data for demand letter
        $data = [
            'contactNumbers' => '09267788685/09187491613',
            'date' => 'NOV. 12, 2025',
            'recipientAddress1' => 'Mr. Juan Dela Cruz',
            'recipientAddress2' => 'Brgy. Wawa, Orani',
            'recipientAddress3' => 'Bataan 2112',
            'recipientName' => 'JUAN DELA CRUZ',
            'monthsOverdue' => '3',
            'amountDue' => '2,775.00',
            'managerName' => 'JAYSON P. MANALILI',
        ];

        $pdf = Pdf::loadView('pdf.demand-letter', $data);

        return $pdf->stream('demand-letter.pdf');
    }

    /**
     * Generate promissory note PDF
     */
    public function generatePromissoryNote()
    {
        // Fake data for testing
        $data = $this->getFakeData();

        $pdf = Pdf::loadView('pdf.promissory-note', $data);

        return $pdf->stream('promissory-note.pdf');
    }

    /**
     * Download promissory note PDF
     */
    public function downloadPromissoryNote()
    {
        $data = $this->getFakeData();

        $pdf = Pdf::loadView('pdf.promissory-note', $data);

        return $pdf->download('promissory-note-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Generate promissory note with custom data
     */
    public function generateCustomNote(Request $request)
    {
        $validated = $request->validate([
            'maker_name' => 'required|string',
            'maker_address' => 'required|string',
            'maker_id' => 'required|string',
            'item_description' => 'required|string',
            'principal_amount' => 'required|numeric|min:0',
            'installment_months' => 'required|integer|min:1',
            'payment_day' => 'required|integer|min:1|max:31',
            'first_payment_date' => 'required|date',
            'note_date' => 'required|date',
        ]);

        $data = $this->prepareNoteData($validated);

        $pdf = Pdf::loadView('pdf.promissory-note', $data);

        return $pdf->stream('promissory-note.pdf');
    }

    /**
     * Get fake data for testing
     */
    private function getFakeData()
    {
        $principalAmount = 11124.00;
        $installmentMonths = 9;
        $installmentAmount = $principalAmount / $installmentMonths;

        return [
            // Maker information
            'maker_name' => 'Celedonio Andrei',
            'maker_address' => 'Sitio Ibayo San Isidro Subic Zambales',
            'maker_id' => '4815-0430-5125-3163',

            // Creditor information
            'creditor_name' => 'RJL Household Appliances Trading',
            'creditor_address' => 'PTR Building, Parang Parang, Orani, Bataan',

            // Item and amount details
            'item_description' => 'Infinix Phone M: Hot 60 Pro Plus 8/256',
            'principal_amount' => $principalAmount,
            'principal_amount_words' => $this->numberToWords($principalAmount) . ' Pesos',
            'installment_amount' => $installmentAmount,
            'installment_amount_words' => $this->numberToWords($installmentAmount) . ' Pesos',
            'installment_months' => $installmentMonths,

            // Payment schedule
            'payment_day' => 10,
            'payment_day_suffix' => $this->getOrdinalSuffix(10),
            'first_payment_date' => '2026-01-10',

            // Note details
            'note_date' => '2025-12-10',
            'note_day' => 10,
            'note_day_suffix' => $this->getOrdinalSuffix(10),
            'signing_location' => 'Orani, Bataan',
            'jurisdiction' => 'Bataan',
        ];
    }

    /**
     * Prepare note data from validated input
     */
    private function prepareNoteData($validated)
    {
        $installmentAmount = $validated['principal_amount'] / $validated['installment_months'];

        return array_merge($validated, [
            'creditor_name' => 'RJL Household Appliances Trading',
            'creditor_address' => 'PTR Building, Parang Parang, Orani, Bataan',
            'principal_amount_words' => $this->numberToWords($validated['principal_amount']) . ' Pesos',
            'installment_amount' => $installmentAmount,
            'installment_amount_words' => $this->numberToWords($installmentAmount) . ' Pesos',
            'payment_day_suffix' => $this->getOrdinalSuffix($validated['payment_day']),
            'note_day' => Carbon::parse($validated['note_date'])->day,
            'note_day_suffix' => $this->getOrdinalSuffix(Carbon::parse($validated['note_date'])->day),
            'signing_location' => 'Orani, Bataan',
            'jurisdiction' => 'Bataan',
        ]);
    }

    /**
     * Convert number to words (for peso amounts)
     */
    private function numberToWords($number)
    {
        $ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        $tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        $teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        $number = round($number, 2);
        $wholeNumber = floor($number);
        $cents = round(($number - $wholeNumber) * 100);

        if ($wholeNumber == 0) {
            return 'Zero';
        }

        $words = '';

        // Thousands
        if ($wholeNumber >= 1000) {
            $thousands = floor($wholeNumber / 1000);
            $words .= $this->convertHundreds($thousands, $ones, $tens, $teens) . ' Thousand ';
            $wholeNumber = $wholeNumber % 1000;
        }

        // Hundreds
        $words .= $this->convertHundreds($wholeNumber, $ones, $tens, $teens);

        return trim($words);
    }

    /**
     * Convert hundreds place
     */
    private function convertHundreds($number, $ones, $tens, $teens)
    {
        $words = '';

        if ($number >= 100) {
            $hundreds = floor($number / 100);
            $words .= $ones[$hundreds] . ' Hundred ';
            $number = $number % 100;
        }

        if ($number >= 20) {
            $tensPlace = floor($number / 10);
            $onesPlace = $number % 10;
            $words .= $tens[$tensPlace] . ' ' . $ones[$onesPlace] . ' ';
        } elseif ($number >= 10) {
            $words .= $teens[$number - 10] . ' ';
        } elseif ($number > 0) {
            $words .= $ones[$number] . ' ';
        }

        return $words;
    }

    /**
     * Get ordinal suffix for day
     */
    private function getOrdinalSuffix($day)
    {
        if ($day >= 11 && $day <= 13) {
            return 'TH';
        }

        switch ($day % 10) {
            case 1:
                return 'ST';
            case 2:
                return 'ND';
            case 3:
                return 'RD';
            default:
                return 'TH';
        }
    }
}
