<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_addToEmployee
 */

use QUI\ERP\Employee\Employees;

/**
 *
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_addToEmployee',
    function ($userId) {
        Employees::getInstance()->addUserToEmployeeGroup($userId);

        return $userId;
    },
    ['userId'],
    'Permission::checkAdminUser'
);
