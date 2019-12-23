<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_getCategories
 */

/**
 * Return the employee panel categories
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_getCategories',
    function () {
        return QUI\ERP\Employee\EmployeePanel::getInstance()->getPanelCategories();
    },
    false,
    'Permission::checkAdminUser'
);
