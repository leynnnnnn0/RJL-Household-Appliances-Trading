# Sales Module

## Purpose

The Sales module provides a management-level view of installment receivables and sales analytics. It is separate from the POS Credit Orders Sales dashboard because it focuses on account aging, collection risk, customer demand trends, and category performance.

## Access

The module is available at `/sales` and currently uses the existing `can view installment orders sales` permission. This means users who can already view POS Credit Orders Sales can also view the Sales analytics module.

## Main Files

- `app/Http/Controllers/SalesController.php` keeps controller actions thin.
- `app/Services/Sales/SalesReportService.php` contains the reporting, aging, and analytics logic.
- `app/Http/Requests/Sales/*` validates filters and PDF requests.
- `resources/js/pages/Sales/Index.tsx` renders the main dashboard.
- `resources/js/pages/Sales/Bucket.tsx` renders the full aging-bucket page.
- `resources/js/components/sales/*` contains reusable filters, summary cards, analytics charts, and responsive aging tables.
- `resources/views/pdf/sales-aging.blade.php` renders the PDF report.
- `tests/Feature/SalesControllerTest.php` covers the module behavior.

## Filters

The primary date filter is `as_of_date`. The UI uses the shared popover calendar component.

Default behavior:

- If `as_of_date` is present, the report uses that exact date.
- If only `month` is present, the report uses the 7th day of that month, such as `2026-03-07`.
- If no date is present, the report uses the 7th day of the current month.

The selected report date drives:

- `month`, derived as `Y-m`
- aging bucket placement
- which installments are considered due
- analytics ending month

Other filters:

- `branch_id`: limits results to one business branch, or `all`
- `item_type`: limits results to `appliances`, `furniture`, `gadgets`, or `all`

## Aging Logic

The service loads non-voided installment orders with these eager-loaded relationships:

- `branch`
- `customer`
- `installment_order_items.item`
- `installment_order_payments.installment_order_payment_history`

Each unpaid installment payment due on or before the report date is evaluated.

Remaining balance formula:

```text
remaining_balance = amount_due - amount_paid - rebate_amount
```

Rows with zero or negative remaining balance are excluded.

Bucket rules:

- `Current`: due date is today or in the future relative to the report date
- `1-30 Days Aging`: 1 to 30 days overdue
- `31-60 Days Aging`: 31 to 60 days overdue
- `61-90 Days Aging`: 61 to 90 days overdue
- `90+ Days Aging`: more than 90 days overdue

Rows are grouped by order and bucket so one account can appear once per aging bucket with combined balances for that bucket.

## Tables

The main Sales page shows five aging tables:

- Current
- 1-30 Days Aging
- 31-60 Days Aging
- 61-90 Days Aging
- 90+ Days Aging

Each table shows 10 rows on the main page. `View More` opens the full bucket page at `/sales/aging`.

Tables are responsive:

- Desktop/tablet: full horizontal table
- Mobile: compact account cards

Each table has a PDF button for that bucket. The filter card also has a `Download All PDF` action.

## Analytics

The analytics section uses the same filters and looks back 12 months ending at the selected report date month.

It calculates:

- new installment account count per month
- installment sales amount per month
- collected amount per month
- category sales and unit counts
- best month by account count
- worst active month by account count
- top category by sales

The analytics are intended for practical business decisions: identifying strong months, slow months, and product categories that deserve stocking or marketing attention.

## Permission Refresh Fix

The global `window.can()` helper now reads the current Inertia page props instead of the initial page payload. This prevents permission-based buttons from staying hidden until a full browser refresh after permissions change.

Shared permissions also use `getAllPermissions()` so both role-based and directly assigned permissions are included.
