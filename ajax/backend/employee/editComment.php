<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_editComment
 */

use QUI\ERP\Employee\Employees;

/**
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_editComment',
    function ($userId, $commentId, $source, $comment) {
        QUI\Permissions\Permission::checkPermission('quiqqer.employee.editComments');

        $User = QUI::getUsers()->get($userId);

        Employees::getInstance()->editComment(
            $User,
            $commentId,
            $source,
            $comment
        );

        return QUI\ERP\Comments::getCommentsByUser($User)->toArray();
    },
    ['userId', 'commentId', 'source', 'comment'],
    'Permission::checkAdminUser'
);
