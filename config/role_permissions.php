<?php

return [
    'cashOrdersModule' => [
        'label' => 'Cash Orders Module',
        'permissions' => [
            'can view cash orders',
            'can view cash order details',
            'can void cash order',
            'can view cash orders sales',
        ],
    ],
    'bulkPaymentsModule' => [
        'label' => 'Bulk Payments Module',
        'permissions' => [
            'can access bulk payments',
        ],
    ],
    'expenseRecordsModule' => [
        'label' => 'Expense Records Module',
        'permissions' => [
            'can view expense records',
            'can view expense record details',
            'can edit expense record',
            'can add expense record',
            'can delete expense record',
            'can review expense record',
        ],
    ],
    'creditOrdersModule' => [
        'label' => 'Credit Orders Module',
        'permissions' => [
            'can view installment orders',
            'can view installment order details',
            'can record installment order payment',
            'can add rebate',
            'can accelerate',
            'can default',
            'can void',
            'can view installment orders sales',
        ],
    ],
    'itemsModulePermission' => [
        'label' => 'Items Module',
        'permissions' => [
            'can view items',
            'can view item details',
            'can add item',
            'can edit item',
            'can archive item',
        ],
    ],
    'referencesModule' => [
        'label' => 'References Module',
        'permissions' => [
            'can manage locations',
            'can manage suppliers',
        ],
    ],
    'customersModule' => [
        'label' => 'Customers Module',
        'permissions' => [
            'can view customers',
            'can view customer details',
        ],
    ],
    'employeesModule' => [
        'label' => 'Employees Module',
        'permissions' => [
            'can view employees',
            'can view employee details',
            'can add employee',
            'can edit employee',
            'can archive employee',
        ],
    ],
    'usersModule' => [
        'label' => 'Users Module',
        'permissions' => [
            'can view users',
            'can view user details',
            'can add user',
            'can edit user',
            'can archive user',
        ],
    ],
    'posPermission' => [
        'label' => 'POS Module',
        'permissions' => [
            'can access cash pos',
            'can access credit pos',
        ],
    ],
];
