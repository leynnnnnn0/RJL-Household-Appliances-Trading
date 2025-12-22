<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Installment Contract</title>
    <style>
        @page {
            margin: 40px 60px;
            size: letter;
        }
        <style>


        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10.5pt;
            line-height: 1.25;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .contact-section {
            text-align: center;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 20pt;
            font-weight: normal;
            letter-spacing: 1px;
            margin-bottom: 2px;
        }
        .address {
            font-weight: bold;
            font-size: 11pt;
        }
        .contact {
            font-weight: bold;
        }
        .contact-number {
            color: #ff0000;
        }
        .date-section {
            text-align: right;
            margin-bottom: 20px;
        }
        .date-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 200px;
            text-align: center;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .date-label {
            font-size: 11pt;
            display: block;
            text-align: center;
            margin-top: 0;
            padding-top: 0;
            line-height: 1;
        }
        .reference-section {
            margin-bottom: 15px;
        }
        .reference-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 300px;
            padding-bottom: 2px;
        }
        .customer-section {
            margin-bottom: 20px;
        }
        .customer-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 300px;
            padding-bottom: 2px;
        }
        .intro-text {
            text-align: justify;
            margin-bottom: 15px;
            font-size: 10pt;
        }
        .policy-item {
            margin-bottom: 12px;
            text-align: justify;
            font-size: 10pt;
        }
        .policy-number {
            font-weight: bold;
            margin-right: 5px;
        }
        .policy-title {
            font-weight: bold;
        }
        .red-bold {
            color: #cc0000;
            font-weight: bold;
        }
        .underline {
            text-decoration: underline;
        }
        .italic {
            font-style: italic;
        }
        .closing {
            text-align: center;
            margin: 20px 0;
            font-size: 10pt;
        }
        .signature-section {
            text-align: right;
            margin-top: 30px;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 240px;
            text-align: center;
            font-weight: bold;
            padding-bottom: 2px;
            margin-bottom: 3px;
        }
        .copy-received {
            margin-top: 40px;
            font-weight: bold;
            font-size: 10pt;
        }
        .copy-name {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 250px;
            padding-bottom: 2px;
        }
    </style>
</head>
<body>
    <div class="contact-section">
        <div class="company-name">RJL HOUSEHOLD APPLIANCES TRADING</div>
        <div class="address">PTR BUILDING PARANG PARANG ORANI, BATAAN</div>
        <div class="contact">CP. NO. <span class="contact-number">{{ $mobileNumber }}</span></div>
    </div>

    <div class="date-section">
        <div style="display: inline-block; text-align: center;">
            <div class="date-line"></div>
            <div class="date-label">Date</div>
        </div>
    </div>

    <div class="reference-section">
        <span class="reference-line">{{ $referenceNumber }}</span>
    </div>

    <div class="customer-section">
        <span class="customer-line">{{ $customerName }}</span>,
    </div>

    <div class="intro-text">
        We are pleased to have you as our customer. For your guidance, the following are the salient points of our installment contract and policies to avoid ambiguities and future misunderstandings:
    </div>

    <div class="policy-item">
        <span class="policy-number">1.</span>
        <span class="policy-title">Your Monthly Installment and Due Date.</span>
        The remaining <span class="red-bold">{{ $remainingMonths }} MONS.</span> monthly installment/s will be due every <span class="red-bold">{{ $dueDay }}</span> day of the month and thereafter until fully paid. Your monthly installment would be <span class="red-bold">PHP {{ $monthlyInstallment }}</span>.
    </div>

    <div class="policy-item">
        <span class="policy-number">2.</span>
        <span class="policy-title">Monthly Payment.</span> You must <span class="underline">demand for the original copy of the official receipt</span> every time you pay. Any payment not covered by an official receipt issued by the company will not be honored.
    </div>

    <div class="policy-item">
        <span class="policy-number">3.</span>
        <span class="policy-title">Default in Payment.</span> <span class="italic">Default in the payment of two or more installments will cause your entire balance to become due and demandable.</span> However, you may voluntarily <span class="underline">deposit</span> the unit should you fail to pay (1) ONE installment due. In this case, we will give you a 30-day grace period to settle your obligation. The company, however, reserves the right to require voluntary surrender of the unit or demand full settlement of the balance if the situation warrants.
    </div>

    <div class="policy-item">
        <span class="policy-number">4.</span>
        <span class="policy-title">Return of the Unit.</span> Should you decide to return the unit for some reason, the cost of its deterioration, missing parts, and repair must be solely shouldered by you. This is a pre-condition for the acceptance of its return and for the extinguishment of your contract and obligation with our company.
    </div>

    <div class="policy-item">
        <span class="policy-number">5.</span>
        <span class="policy-title">Reclaiming the Unit.</span> You may retrieve the unit upon full settlement of all unpaid monthly installments, together with an additional advance payment equivalent to one month's installment. Such retrieval shall only be permitted upon compliance with this requirement and any other applicable conditions imposed by RJL Household Appliances Trading.
    </div>

    <div class="policy-item">
        <span class="policy-number">6.</span>
        <span class="policy-title">Sale or Pledge of a Unit.</span> The company has a lien over the unit. The same may not be sold or pledged to another person without the knowledge and consent of our company.
    </div>

    <div class="policy-item">
        <span class="policy-number">7.</span>
        <span class="policy-title">Loss of a Unit.</span> The loss of a unit or any of its parts, due to theft or any other related cases, does not extinguish your obligation to pay for the unit. Therefore, it is important that you exercise due diligence to prevent its loss. Otherwise, we shall be compelled to pursue the necessary legal actions to protect our company's interest.
    </div>

    <div class="closing">
        Thank you for your patronage and we look forward to more transactions with you.
    </div>

    <div class="signature-section">
        <div style="display: inline-block; text-align: center;">
            <div style="margin-bottom: 25px;">Very truly yours,</div>
            <div class="signature-line">{{ $managerName }}</div>
            <div style="font-weight: bold; margin-top: 3px; font-size: 10pt;">Store Manager</div>
        </div>
    </div>

    <div class="copy-received">
        <div style="margin-bottom: 10px;">
            <span class="copy-name">{{ $customerName }}</span>
        </div>
        <div>Copy received by</div>
    </div>
</body>
</html>