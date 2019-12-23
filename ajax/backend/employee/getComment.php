<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_employee_getComment
 */

use QUI\ERP\Employee\Employees;

/**
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_employee_getComment',
    function ($userId, $commentId, $source) {
        $User     = QUI::getUsers()->get($userId);
        $comments = Employees::getInstance()->getUserComments($User)->toArray();

        foreach ($comments as $comment) {
            if ($comment['id'] === $commentId && $comment['source'] === $source) {
                return $comment['message'];
            }
        }

        return '';
    },
    ['userId', 'commentId', 'source'],
    'Permission::checkAdminUser'
);
