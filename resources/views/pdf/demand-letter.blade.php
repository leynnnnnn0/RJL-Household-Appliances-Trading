<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Demand Letter</title>
    <style>
        @page {
            margin: 40px 80px;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
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
        .black-bar {
            background-color: #000;
            height: 25px;
            margin-left: -80px;
            margin-right: -80px;
            margin-top: 20px;
            margin-bottom: 0;
        }
        .white-space {
            height: 80px;
        }
        .contact-section {
            text-align: center;
            margin-bottom: 30px;
        }
        .contact {
            font-weight: bold;
        }
        .contact-number {
            color: #ff0000;
        }
        .title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            text-decoration: underline;
            margin-top: 30px;
            margin-bottom: 40px;
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
        .body-text {
            text-align: justify;
            margin-bottom: 15px;
        }
        .amount-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 100px;
            text-align: center;
        }
        .closing {
            margin-top: 30px;
            margin-bottom: 60px;
        }
        .signature-section {
            margin-top: 50px;
        }
        .signature-name {
            font-weight: bold;
            text-decoration: underline;
        }
        .footer-line {
            border-top: 1px solid #000;
            display: inline-block;
            min-width: 380px;
            margin-top: 80px;
        }
    </style>
</head>
<body>

    <div class="contact-section">
        <div class="company-name">RJL HOUSEHOLD APPLIANCES TRADING</div>
        <div class="address">PTR BUILDING PARANG PARANG ORANI, BATAAN</div>
        <div class="contact">CP. NO. <span class="contact-number">{{ $contactNumbers }}</span></div>
    </div>

    <div class="title">
        DEMAND LETTER
    </div>

       <div class="date-section">
        <div style="display: inline-block; text-align: center;">
            <div class="date-line"></div>
            <div class="date-label">Date</div>
        </div>
    </div>

    <div style="margin-bottom: 35px;">
        <span class="address-line"></span><br>
        <span class="address-line"></span><br>
        <span class="address-line"></span>
    </div>

    <div style="margin-bottom: 25px;">
        Dear Mr/Mrs.<span style="border-bottom: 1px solid #000; display: inline-block; min-width: 280px;"></span>,
    </div>

    <div class="body-text">
        The condition of your account is causing us great concern as it is now currently past due for <span class="amount-line" style="min-width: 90px;"></span> months in the amount of P <span class="amount-line" style="min-width: 180px;"></span> including penalty, which amount is overdue and remains unpaid despite repeated requests for payment.
    </div>

    <div class="body-text">
        Unless payment of the above amount is received by us in full within <strong>FIVE (5) DAYS FROM THE RECEIPT OF THIS LETTER</strong>, we will instruct our Attorney to institute the necessary legal proceedings against you to recover the above amount, together with interest of legal expenses, and/or to secure the return the unit you have procured from our store.
    </div>

    <div class="body-text">
        Please give this matter your preferential attention.
    </div>

    <div class="closing">
        Sincerely,
    </div>

    <div class="signature-section">
        <div class="signature-name">{{ $managerName }}</div>
        <div style="font-size: 11pt;">Store Manager in Charge</div>
    </div>

    <div>
        <span class="footer-line">Customer's Received Copy</span>
    </div>
</body>
</html>