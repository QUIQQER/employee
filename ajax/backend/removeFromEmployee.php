<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_removeFromEmployee
 */

use QUI\ERP\Employee\Employees;

/**
 *
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_removeFromEmployee',
    function ($userId) {
        Employees::getInstance()->removeUserFromEmployeeGroup($userId);

        return $userId;
    },
    ['userId'],
    'Permission::checkAdminUser'
);
