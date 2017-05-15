<?php

/**
 * This file contains QUI\ERP\Employee\EventHandler
 */

namespace QUI\ERP\Employee;

use QUI;
use QUI\Package\Package;

/**
 * Class EventHandler
 *
 * @package QUI\ERP
 */
class EventHandler
{
    /**
     * event: on package setup
     * - create customer group
     *
     * @param Package $Package
     */
    public static function onPackageSetup(Package $Package)
    {
        if ($Package->getName() != 'quiqqer/employee') {
            return;
        }

        // create customer group
        $Config  = $Package->getConfig();
        $groupId = $Config->getValue('employee', 'groupId');

        if (!empty($groupId)) {
            return;
        }

        $Root = QUI::getGroups()->firstChild();

        $Customer = $Root->createChild(
            QUI::getLocale()->get('quiqqer/employee', 'employee.group.name'),
            QUI::getUsers()->getSystemUser()
        );

        $Config->setValue('employee', 'groupId', $Customer->getId());
        $Config->save();
    }

    /**
     * event : on admin header loaded
     */
    public static function onAdminLoadFooter()
    {
        if (!defined('ADMIN') || !ADMIN) {
            return;
        }

        $Package = QUI::getPackageManager()->getInstalledPackage('quiqqer/employee');
        $Config  = $Package->getConfig();
        $groupId = $Config->getValue('employee', 'groupId');

        echo '<script>var QUIQQER_EMPLOYEE_GROUP = ' . $groupId . '</script>';
    }
}
