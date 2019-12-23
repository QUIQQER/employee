<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_create_getCategories
 */

/**
 * Return the categories for the employee creation control
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_create_getCategories',
    function () {
        return QUI\ERP\Employee\Utils::getInstance()->getCategoriesForEmployeeCreate();
    },
    false,
    'Permission::checkAdminUser'
);
