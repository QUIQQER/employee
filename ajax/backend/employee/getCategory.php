<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_getCategory
 */

/**
 * Return one employee panel from employee categories
 *
 * @return string
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_getCategory',
    function ($category) {
        return QUI\ERP\Employee\EmployeePanel::getInstance()->getPanelCategory($category);
    },
    ['category'],
    'Permission::checkAdminUser'
);
