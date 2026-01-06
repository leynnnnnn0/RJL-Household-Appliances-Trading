<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promissory Note</title>
    <style>
        @page {
            margin: 1in;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .title {
            text-decoration: underline;
            font-weight: bold;
            font-size: 14pt;
        }
        .underline {
            text-decoration: underline;
            font-weight: bold;
        }
        .content {
            text-align: justify;
            margin-bottom: 20px;
        }
        .section-title {
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 10px;
        }
        .signature-section {
            margin-top: 50px;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            width: 300px;
            margin: 30px 0 5px 0;
        }
        .label {
            font-weight: bold;
            margin-top: 5px;
        }
        sup {
            font-size: 8pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">PROMISSORY NOTE</div>
    </div>

    <div class="content">
        <p><span class="underline">{{ strtoupper(\Carbon\Carbon::parse($note_date)->format('F d, Y')) }}</span></p>
        
        <p><span class="underline">{{ strtoupper($item_description) }}</span></p>
        
        <p><span class="underline">(PHP {{ number_format($principal_amount, 2) }})</span></p>
    </div>

    <div class="content">
        <p>
            FOR VALUE RECEIVED, I <span class="underline">{{ strtoupper($maker_name) }}</span> 
            unconditionally promises to pay to the order of {{ strtoupper($creditor_name) }} 
            with business address at {{ $creditor_address }}, the principal sum of 
            <span class="underline">{{ strtoupper($principal_amount_words) }}</span> 
            (PHP <span class="underline">{{ number_format($principal_amount, 2) }}</span>), 
            in the installment amount of <span class="underline">{{ strtoupper($installment_amount_words) }}</span> 
            (<span class="underline">PHP {{ number_format($installment_amount, 2) }}</span>) 
            for <span class="underline">{{ $installment_months }} MONS.</span> successive months, 
            due and payable without need of notice or demand every 
            <span class="underline">{{ $payment_day }}<sup>{{ $payment_day_suffix }}</sup></span> 
            day of each month starting on 
            <span class="underline">{{ strtoupper(\Carbon\Carbon::parse($first_payment_date)->format('M. Y')) }}</span>, 
            provided that a late payment of One Hundred Pesos (PHP 100.00) per month shall be added on 
            each unpaid installment from due date thereof until fully Paid.
        </p>

        <p>
            Default in the payment of at least two months installments including additional late charges 
            shall cause the total outstanding balance to become due and demandable.
        </p>

        <p>
            In addition to the foregoing, I promise to pay monthly interest fixed within the limits of 
            the maximum percentage allowed by law. However, if a law should be enacted increasing the 
            threshold of said lawful interest, I authorize {{ strtoupper($creditor_name) }}, its successors 
            or assigns, to correspondingly increase the interest rate stipulated in this note. In case I 
            do not accept the increased rate of interest, I agree to immediately pay the remaining balance 
            of my obligation under this promissory note.
        </p>

        <p>
            And in case it becomes necessary to collect this note through any Attorney-At-Law or a 
            collection agency, an additional sum of not less than twenty five percent (25%) of the sum 
            due shall be paid to the holder/s hereof for attorney's fees and/or collection costs aside 
            from the legal cost provided under the Rules of Court, I further agree that any legal action 
            that may arise from here shall be instituted before the Courts of the Province of 
            {{ $jurisdiction }}, Philippines.
        </p>
    </div>

    <div class="section-title">ADDITIONAL TERMS AND CONDITIONS</div>

    <div class="content">
        <p>
            I hereby waive the presentment for payment, notice of protest, notice of dishonor and notice 
            of non-payment of this note and demand.
        </p>

        <p>
            Acceptance by the holder/s hereof payment of any installment or any part hereof after due 
            date shall not be considered as extending the time for the payment of installment/s aforesaid 
            or as a modification of any of the conditions hereof and shall in no case release the maker(s) 
            of this note from liability for the payment of the herein obligation.
        </p>

        <p>
            It is expressly understood that principal amount due herein shall be subject to proportionate 
            upward adjustment in the event an extraordinary decrease in the effective value of the purchasing 
            power of the Philippine currency. An increase of fifteen percent (15%) or more over the Consumer 
            Price Index for Manila's of the date hereof as set forth in figures officially released by the 
            Department of Economics Research of the Central Bank of the Philippines (or by any other office 
            or agency of the Philippine Government, in the absence of any official figures from the Central 
            Bank of the Philippines) shall be regarded as an extraordinary decrease in the effective value 
            or in the purchasing power of the Philippine Currency.
        </p>

        <p>
            The holder of this note may assign his or her rights to any third party without the consent 
            of either maker(s) or indorser(s).
        </p>

        <p>
            I further promise that all correspondence relative to this promissory note, including demand 
            letters, summons, subpoenas, or notification of any judicial or extrajudicial action shall be 
            sent to this address: <span class="underline">{{ strtoupper($maker_address) }}</span>. 
            The mere act of sending any correspondence by mail or by personal delivery to the said address 
            shall be valid and effective notice to us and for all legal intents and purposes, and that fact 
            that I did not receive any communication, or that it has been returned unclaimed, or that no 
            person was found at the said given address, or that the address is fictitious or it cannot be 
            located, shall not excuse or relieve me from the effects of such notice.
        </p>

        <p>
            I HEREBY AFFIRM AND ACKNOWLEDGE THAT I HAVE CAREFULLY READ AND HAVE UNDERSTOOD ALL THE FOREGOING 
            STIPULATIONS.
        </p>
    </div>

    <div class="content">
        <p>
            <strong>IN WITNESS WHEREOF,</strong> I have hereunto set my hand this 
            <span class="underline">{{ $note_day }}<sup>{{ $note_day_suffix }}</sup></span> 
            day of <span class="underline">{{ strtoupper(\Carbon\Carbon::parse($note_date)->format('M Y')) }}</span> 
            at {{ $signing_location }}, Philippines.
        </p>
    </div>

    <div class="signature-section">
        <div class="signature-line"></div>
        <div class="label">{{ strtoupper($maker_name) }}</div>
        <div class="label">MAKER</div>
        <div class="label">ID NO.: {{ $maker_id }}</div>
    </div>

    <div class="signature-section" style="margin-top: 60px;">
        <p>
            <strong>SUBSCRIBED AND SWORN</strong> to before me this _____ day of _________________ 20_____ 
            at {{ $signing_location }}, Philippines.
        </p>
        
        <p><strong>WITNESS MY HAND AND SEAL.</strong></p>
        
        <div class="signature-line" style="margin-top: 40px;"></div>
        <div class="label">NOTARY PUBLIC</div>
    </div>
</body>
</html>