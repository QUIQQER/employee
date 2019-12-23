<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_getEmployeesData
 */

/**
 * Return the employee data
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_getEmployeesData',
    function ($employeeIds) {
        $employeeIds = \json_decode($employeeIds, true);
        $result      = [];

        foreach ($employeeIds as $employeeId) {
            try {
                $User = QUI::getUsers()->get($employeeId);

                $result[] = [
                    'id'       => $User->getId(),
                    'title'    => $User->getName(),
                    'username' => $User->getUsername()
                ];
            } catch (QUI\Exception $Exception) {
                QUI\System\Log::addDebug($Exception->getMessage());
            }
        }

        return $result;
    },
    ['employeeIds'],
    'Permission::checkAdminUser'
);
