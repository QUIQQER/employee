<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_getCategory
 */

/**
 * Return one employee panel from employee categories
 *
 * @return string
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_getAddress',
    function ($userId) {
        $User    = QUI::getUsers()->get($userId);
        $Address = $User->getStandardAddress();

        $attributes         = $Address->getAttributes();
        $attributes['id']   = $Address->getId();
        $attributes['text'] = $Address->getText();

        return $attributes;
    },
    ['userId'],
    'Permission::checkAdminUser'
);
