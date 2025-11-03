<?php

namespace App\Enums;

enum ExpenseCategory : string
{
    case FUEL = 'fuel';
    case REPAIR = 'repair';
    case SUPPLIES = 'supplies';
    case MEAL = 'meal';
    case EMERGENCY = 'emergency';
    case OTHER = 'other';
}
