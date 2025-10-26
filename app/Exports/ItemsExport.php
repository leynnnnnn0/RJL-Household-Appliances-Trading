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
    public function collection()
    {
        return collect([]);
    }

    public function headings(): array
    {
        return [
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

        // Format date columns (K and L) for rows 2-1000
        $sheet->getStyle('K2:K1000')->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_DATE_DDMMYYYY);
        
        $sheet->getStyle('L2:L1000')->getNumberFormat()
            ->setFormatCode(NumberFormat::FORMAT_DATE_DDMMYYYY);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20, // Category
            'B' => 20, // Location
            'C' => 12, // DR No
            'D' => 20, // Supplier
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
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // Get categories
                $categories = Category::all()->pluck('name')->toArray();
                $categoryList = '"' . implode(',', $categories) . '"';
                
                // Get locations
                $locations = Location::all()->pluck('name')->toArray();
                $locationList = '"' . implode(',', $locations) . '"';
                
                // Add dropdown validation for Category column (A2:A1000)
                if (!empty($categories)) {
                    $validation = $sheet->getCell('A2')->getDataValidation();
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
                        $sheet->getCell('A' . $i)->setDataValidation(clone $validation);
                    }
                }
                
                // Add dropdown validation for Location column (B2:B1000)
                if (!empty($locations)) {
                    $validation = $sheet->getCell('B2')->getDataValidation();
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
                        $sheet->getCell('B' . $i)->setDataValidation(clone $validation);
                    }
                }
            },
        ];
    }
}