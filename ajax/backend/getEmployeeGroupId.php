<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_getEmployeeGroupId
 */

/**
 * Return the employee group id
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_getEmployeeGroupId',
    function () {
        try {
            return QUI\ERP\Employee\Employees::getInstance()->getEmployeeGroupId();
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::addError($Exception->getMessage());
        }

        return 0;
    },
    false,
    'Permission::checkAdminUser'
);
