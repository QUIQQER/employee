<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_files_upload
 */

use QUI\Permissions\Permission;

/**
 * Upload finish event
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_files_delete',
    function ($files, $employeeId) {
        QUI\ERP\Employee\EmployeeFiles::deleteFiles(
            $employeeId,
            \json_decode($files, true)
        );
    },
    ['files', 'employeeId'],
    'Permission::checkAdminUser'
);
