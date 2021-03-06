<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_save
 */

/**
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_instantSave',
    function ($userId, $data) {
        QUI\Permissions\Permission::checkPermission('quiqqer.employee.edit');

        $User = QUI::getUsers()->get($userId);
        $data = \json_decode($data, true);

        try {
            $Address = $User->getStandardAddress();
        } catch (QUI\Exception $Exception) {
            // create one
            $Address = $User->addAddress([]);
        }

        if (!empty($data['username'])) {
            $User->setAttribute('username', $data['username']);
        }

        if (!empty($data['firstname'])) {
            $User->setAttribute('firstname', $data['firstname']);
            $Address->setAttribute('firstname', $data['firstname']);
        }

        if (!empty($data['lastname'])) {
            $User->setAttribute('lastname', $data['lastname']);
            $Address->setAttribute('lastname', $data['lastname']);
        }

        if (!empty($data['email'])) {
            $User->setAttribute('email', $data['email']);

            $Address->clearMail();
            $Address->addMail($data['email']);
        }

        $Address->save();
        $User->save();
    },
    ['userId', 'data'],
    'Permission::checkAdminUser'
);
