<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

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

    public function installmentContract()
    {
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
}