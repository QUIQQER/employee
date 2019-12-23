<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_addComment
 */

use QUI\ERP\Employee\Employees;

/**
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_addComment',
    function ($userId, $comment) {
        $User = QUI::getUsers()->get($userId);
        Employees::getInstance()->addCommentToUser($User, $comment);

        return QUI\ERP\Comments::getCommentsByUser($User)->toArray();
    },
    ['userId', 'comment'],
    'Permission::checkAdminUser'
);
