<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_save
 */

use QUI\ERP\Employee\Employees;

/**
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_save',
    function ($userId, $data) {
        QUI\Permissions\Permission::checkPermission('quiqqer.employee.edit');

        Employees::getInstance()->setAttributesToEmployee(
            $userId,
            \json_decode($data, true)
        );
    },
    ['userId', 'data'],
    'Permission::checkAdminUser'
);
