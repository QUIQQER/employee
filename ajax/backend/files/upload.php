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
    'package_quiqqer_employee_ajax_backend_files_upload',
    function ($File, $employeeId) {
        if (!Permission::hasPermission('quiqqer.employee.fileUpload')) {
            return false;
        }

        if (!($File instanceof QUI\QDOM)) {
            return true;
        }

        $file = $File->getAttribute('filepath');

        if (!\file_exists($file)) {
            return true;
        }

        QUI\ERP\Employee\EmployeeFiles::addFileToEmployee($employeeId, $file);

        return true;
    },
    ['File', 'employeeId'],
    'Permission::checkAdminUser'
);
