<?php

namespace QUI\ERP\Employee;

use QUI;

/**
 * Class Utils
 *
 * @package QUI\ERP\Employee
 */
class Utils extends QUI\Utils\Singleton
{
    /**
     * @return array
     */
    public function getCategoriesForEmployeeCreate()
    {
        $categories = [];

        $categories[] = [
            'text'      => QUI::getLocale()->get('quiqqer/employee', 'employee.create.category.details'),
            'textimage' => 'fa fa-id-card',
            'require'   => ''
        ];

        $categories[] = [
            'text'      => QUI::getLocale()->get('quiqqer/employee', 'employee.create.category.address'),
            'textimage' => 'fa fa-address-book',
            'require'   => ''
        ];

        return $categories;
    }
}
