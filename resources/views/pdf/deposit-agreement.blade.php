<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Deposit Agreement</title>
    <style>
        @page {
            margin: 40px 60px;
            size: letter;
        }
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
        .address-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 300px;
            margin-bottom: 3px;
        }
        .title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            text-decoration: underline;
            margin-top: 30px;
            margin-bottom: 30px;
        }
        .intro-text {
            text-align: justify;
            margin-bottom: 15px;
        }
        .unit-details {
            margin-bottom: 15px;
        }
        .detail-row {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
        }
        .detail-label {
            display: inline-block;
            width: 150px;
            font-weight: bold;
        }
        .detail-colon {
            font-weight: bold;
            margin: 0 5px;
        }
        .detail-value {
            border-bottom: 1px solid #000;
            flex: 1;
            height: 20px;
        }
        .commitment-text {
            text-align: justify;
            margin-bottom: 15px;
        }
        .days-box {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 50px;
            text-align: center;
            height: 20px;
            margin: 0 3px;
        }
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .payment-table th {
            border-bottom: 2px solid #000;
            padding: 6px 5px;
            text-align: left;
            font-weight: bold;
            font-size: 10pt;
        }
        .payment-table td {
            border-bottom: 1px solid #000;
            padding: 10px 5px;
            height: 20px;
        }
        .footer-note {
            text-align: justify;
            margin-top: 15px;
            margin-bottom: 25px;
        }
        .signature-section {
            text-align: right;
            margin-top: 30px;
            margin-bottom: 40px;
        }
        .signature-block {
            display: inline-block;
            text-align: center;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 280px;
            text-align: center;
            margin-top: 35px;
            padding-bottom: 1px;
        }
    </style>
</head>
<body>
    <div class="contact-section">
        <div class="company-name">RJL HOUSEHOLD APPLIANCES TRADING</div>
        <div class="address">PTR BUILDING PARANG PARANG ORANI, BATAAN</div>
        <div class="contact">CP. NO. <span class="contact-number">{{ $contactNumbers }}</span></div>
    </div>

    <div class="date-section">
        <div style="display: inline-block; text-align: center;">
            <div class="date-line">{{ strtoupper($date) }}</div>
            <div class="date-label">Date</div>
        </div>
    </div>

    <div style="margin-bottom: 15px;">
        <span class="address-line"></span><br>
        <span class="address-line"></span>
    </div>

    <div style="margin-bottom: 15px;">
        <strong>Sir/Madam:</strong>
    </div>

    <div class="title">
        DEPOSIT AGREEMENT
    </div>

    <div class="intro-text">
        In view of my due mortgage obligation with your company, I am depositing the property described below:
    </div>

    <div class="unit-details">
        <div class="detail-row">
            <span class="detail-label">BRAND</span>
            <span class="detail-colon">:</span>
            <span class="detail-value"></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">MODEL</span>
            <span class="detail-colon">:</span>
            <span class="detail-value"></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">SERIAL NUMBER</span>
            <span class="detail-colon">:</span>
            <span class="detail-value"></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">COLOR</span>
            <span class="detail-colon">:</span>
            <span class="detail-value"></span>
        </div>
    </div>

    <div class="commitment-text">
        I commit to redeem the unit/equipment within <span class="days-box"></span> days and by paying the due installment/s on the dates specified below:
    </div>

    <table class="payment-table">
        <thead>
            <tr>
                <th style="width: 18%;">DUE DATE</th>
                <th style="width: 20%;">PRINCIPAL</th>
                <th style="width: 18%;">INTEREST</th>
                <th style="width: 18%;">TOTAL</th>
                <th style="width: 26%;">PAYMENT DATES</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="footer-note">
        I am affixing my signature to this document with the understanding that the company shall forfeit the unit I have procured if I will fail to settle my obligation or to redeem the item within the grace period provided.
    </div>

    <div class="signature-section">
        <div class="signature-block">
            <div style="margin-bottom: 35px;">Very truly yours,</div>
            <div class="signature-line"></div>
            <div style="font-weight: bold; margin-top: 3px;">(Name of Customer)</div>
        </div>
    </div>
</body>
</html>