<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_getEmployeeLoginFlag
 */

/**
 * Return one employee panel from employee categories
 *
 * @return string
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_getEmployeeLoginFlag',
    function () {
        return QUI\ERP\Employee\Employees::getInstance()->getEmployeeLoginFlag();
    },
    false,
    'Permission::checkAdminUser'
);
