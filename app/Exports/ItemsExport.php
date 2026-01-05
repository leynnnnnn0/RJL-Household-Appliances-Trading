<?php

namespace App\Exports;

use App\Models\Supplier;
use App\Models\Location;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use Maatwebsite\Excel\Events\AfterSheet;

class ItemsExport implements FromCollection, WithHeadings, WithStyles, WithColumnWidths, WithEvents
{
    protected $items;

    public function __construct($items = null)
    {
        $this->items = $items;
    }

    public function collection()
    {
        // If no items provided, return empty collection (for template)
        if ($this->items === null) {
            return collect([]);
        }

        // Map items to export format
        return $this->items->map(function ($item) {
            return [
                'item_type' => $item->item_type,
                'supplier' => $item->supplier,
                'location' => $item->location->name ?? '',
                'dr_no' => $item->dr_no,
                'description' => $item->description,
                'model' => $item->model,
                'serial' => $item->serial,
                'quantity' => $item->quantity,
                'srp' => $item->srp,
                'unit_cost' => $item->unit_cost,
                'date_of_purchase' => $item->date_of_purchase,
                'date_out' => $item->date_out,
                'size' => $item->size ?? '',
                'remarks' => $item->remarks,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Item Type',
            'Supplier',
            'Location',
            'DR No',
            'Description',
            'Model',
            'Serial',
            'Quantity',
            'SRP',
            'Unit Cost',
            'Date of Purchase',
            'Date Out',
            'Size',
            'Remarks'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Style the header row
        $sheet->getStyle('1:1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 12,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4472C4'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        $sheet->getStyle('K2:K1000')->getNumberFormat()
            ->setFormatCode('dd/mm/yyyy');

        $sheet->getStyle('L2:L1000')->getNumberFormat()
            ->setFormatCode('dd/mm/yyyy');

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15, // Item Type
            'B' => 20, // Supplier
            'C' => 20, // Location
            'D' => 12, // DR No
            'E' => 30, // Description
            'F' => 15, // Model
            'G' => 15, // Serial
            'H' => 10, // Quantity
            'I' => 12, // SRP
            'J' => 12, // Unit Cost
            'K' => 18, // Date of Purchase
            'L' => 15, // Date Out
            'M' => 10, // Size
            'N' => 25, // Remarks
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                if ($this->items === null) {
                    try {
                        // Item Type dropdown
                        $itemTypes = ['appliances', 'gadgets', 'furniture'];
                        $itemTypeList = '"' . implode(',', $itemTypes) . '"';
                        $this->addDropdownValidation($sheet, 'A', $itemTypeList, 'Item Type');

                        // Location dropdown
                        $locations = Location::all()->pluck('name')->toArray();

                        if (!empty($locations)) {
                            // Clean the data - remove problematic characters
                            $locations = array_map(function ($name) {
                                return str_replace(['"', ',', "\n", "\r"], '', $name);
                            }, $locations);

                            $locationList = '"' . implode(',', $locations) . '"';

                            // Check if list is too long (255 char limit)
                            if (strlen($locationList) <= 255) {
                                $this->addDropdownValidation($sheet, 'C', $locationList, 'Location');
                            } else {
                                \Log::warning('Location dropdown list exceeds 255 character limit!');
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::error('Excel export error: ' . $e->getMessage());
                        \Log::error('Stack trace: ' . $e->getTraceAsString());
                    }
                }
            },
        ];
    }

    private function addDropdownValidation($sheet, $column, $list, $title)
    {
        $validation = $sheet->getCell($column . '2')->getDataValidation();
        $validation->setType(DataValidation::TYPE_LIST);
        $validation->setErrorStyle(DataValidation::STYLE_INFORMATION);
        $validation->setAllowBlank(false);
        $validation->setShowInputMessage(true);
        $validation->setShowErrorMessage(true);
        $validation->setShowDropDown(true);
        $validation->setErrorTitle('Invalid ' . $title);
        $validation->setError('Please select a ' . strtolower($title) . ' from the dropdown.');
        $validation->setPromptTitle('Select ' . $title);
        $validation->setPrompt('Choose a ' . strtolower($title) . ' from the list.');
        $validation->setFormula1($list);

        for ($i = 2; $i <= 1000; $i++) {
            $sheet->getCell($column . $i)->setDataValidation(clone $validation);
        }
    }
}
