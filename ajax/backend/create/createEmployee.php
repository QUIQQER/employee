<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_create_createEmployee
 */

/**
 * Create a new employee
 *
 * @return integer
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_create_createEmployee',
    function ($employee, $address, $groups) {
        $address = \json_decode($address, true);
        $groups  = \json_decode($groups, true);

        $User = QUI\ERP\Employee\Employees::getInstance()->createEmployee(
            $employee,
            $address,
            $groups
        );

        return $User->getId();
    },
    ['employee', 'address', 'groups'],
    'Permission::checkAdminUser'
);
