<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_getTaxByUser
 */

/**
 * Return the tax of this user
 *
 * @return string
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_getTaxByUser',
    function ($userId) {
        try {
            $User = QUI::getUsers()->get($userId);
            $Tax  = QUI\ERP\Tax\Utils::getTaxByUser($User);
            $Area = $Tax->getArea();
        } catch (QUI\Exception $Exception) {
            return null;
        }

        return [
            'id'   => $Tax->getId(),
            'vat'  => $Tax->getValue(),
            'area' => [
                'id'    => $Area->getId(),
                'title' => $Area->getTitle()
            ]
        ];
    },
    ['userId'],
    'Permission::checkAdminUser'
);
