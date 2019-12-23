<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_files_getList
 */

use QUI\Permissions\Permission;

/**
 * Return the permissions for file action
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_files_getPermissions',
    function () {
        return [
            'fileEdit'   => Permission::hasPermission('quiqqer.employee.fileEdit'),
            'fileView'   => Permission::hasPermission('quiqqer.employee.fileView'),
            'fileUpload' => Permission::hasPermission('quiqqer.employee.fileUpload'),
        ];
    },
    false,
    'Permission::checkAdminUser'
);
