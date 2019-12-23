<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_passwordMail
 */

/**
 * Send the employee a password reset mail
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_passwordMail',
    function ($userId) {
        $User = QUI::getUsers()->get($userId);

        $Handler = QUI\Users\Auth\Handler::getInstance();
        $Handler->sendPasswordResetVerificationMail($User);

        QUI::getMessagesHandler()->addSuccess(
            QUI::getLocale()->get('quiqqer/employee', 'message.employee.password.mail.send')
        );
    },
    ['userId'],
    'Permission::checkAdminUser'
);
