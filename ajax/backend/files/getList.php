<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_files_getList
 */

/**
 * Return the file list of a employee
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_files_getList',
    function ($employeeId) {
        return QUI\ERP\Employee\EmployeeFiles::getFileList($employeeId);
    },
    ['employeeId'],
    'Permission::checkAdminUser'
);
