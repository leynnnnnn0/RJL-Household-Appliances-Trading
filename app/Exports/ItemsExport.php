<?php

namespace App\Exports;

use App\Models\Category;
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
        return $this->items->map(function($item) {
            return [
                'item_type' => $item->item_type,
                'category' => $item->category,
                'location' => $item->location->name ?? '',
                'dr_no' => $item->dr_no,
                'supplier' => $item->supplier,
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
            'Category',
            'Location',
            'DR No',
            'Supplier',
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

        // Format date columns (L and M) for rows 2-1000
        $sheet->getStyle('L2:L1000')->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_DATE_DDMMYYYY);
        
        $sheet->getStyle('M2:M1000')->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_DATE_DDMMYYYY);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15, // Item Type
            'B' => 20, // Category
            'C' => 20, // Location
            'D' => 12, // DR No
            'E' => 20, // Supplier
            'F' => 30, // Description
            'G' => 15, // Model
            'H' => 15, // Serial
            'I' => 10, // Quantity
            'J' => 12, // SRP
            'K' => 12, // Unit Cost
            'L' => 18, // Date of Purchase
            'M' => 15, // Date Out
            'N' => 10, // Size
            'O' => 25, // Remarks
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // Only add dropdowns if this is a template (no items)
                if ($this->items === null) {
                    // Item Type dropdown options
                    $itemTypes = ['appliances', 'gadgets', 'furniture'];
                    $itemTypeList = '"' . implode(',', $itemTypes) . '"';
                    
                    // Get categories
                    $categories = Category::all()->pluck('name')->toArray();
                    $categoryList = '"' . implode(',', $categories) . '"';
                    
                    // Get locations
                    $locations = Location::all()->pluck('name')->toArray();
                    $locationList = '"' . implode(',', $locations) . '"';
                    
                    // Add dropdown validation for Item Type column (A2:A1000)
                    $validation = $sheet->getCell('A2')->getDataValidation();
                    $validation->setType(DataValidation::TYPE_LIST);
                    $validation->setErrorStyle(DataValidation::STYLE_INFORMATION);
                    $validation->setAllowBlank(false);
                    $validation->setShowInputMessage(true);
                    $validation->setShowErrorMessage(true);
                    $validation->setShowDropDown(true);
                    $validation->setErrorTitle('Invalid Item Type');
                    $validation->setError('Please select an item type from the dropdown.');
                    $validation->setPromptTitle('Select Item Type');
                    $validation->setPrompt('Choose: appliances, gadgets, or furniture.');
                    $validation->setFormula1($itemTypeList);
                    
                    // Apply to range
                    for ($i = 2; $i <= 1000; $i++) {
                        $sheet->getCell('A' . $i)->setDataValidation(clone $validation);
                    }
                    
                    // Add dropdown validation for Category column (B2:B1000)
                    if (!empty($categories)) {
                        $validation = $sheet->getCell('B2')->getDataValidation();
                        $validation->setType(DataValidation::TYPE_LIST);
                        $validation->setErrorStyle(DataValidation::STYLE_INFORMATION);
                        $validation->setAllowBlank(false);
                        $validation->setShowInputMessage(true);
                        $validation->setShowErrorMessage(true);
                        $validation->setShowDropDown(true);
                        $validation->setErrorTitle('Invalid Category');
                        $validation->setError('Please select a category from the dropdown.');
                        $validation->setPromptTitle('Select Category');
                        $validation->setPrompt('Choose a category from the list.');
                        $validation->setFormula1($categoryList);
                        
                        // Apply to range
                        for ($i = 2; $i <= 1000; $i++) {
                            $sheet->getCell('B' . $i)->setDataValidation(clone $validation);
                        }
                    }
                    
                    // Add dropdown validation for Location column (C2:C1000)
                    if (!empty($locations)) {
                        $validation = $sheet->getCell('C2')->getDataValidation();
                        $validation->setType(DataValidation::TYPE_LIST);
                        $validation->setErrorStyle(DataValidation::STYLE_INFORMATION);
                        $validation->setAllowBlank(false);
                        $validation->setShowInputMessage(true);
                        $validation->setShowErrorMessage(true);
                        $validation->setShowDropDown(true);
                        $validation->setErrorTitle('Invalid Location');
                        $validation->setError('Please select a location from the dropdown.');
                        $validation->setPromptTitle('Select Location');
                        $validation->setPrompt('Choose a location from the list.');
                        $validation->setFormula1($locationList);
                        
                        // Apply to range
                        for ($i = 2; $i <= 1000; $i++) {
                            $sheet->getCell('C' . $i)->setDataValidation(clone $validation);
                        }
                    }
                }
            },
        ];
    }
}