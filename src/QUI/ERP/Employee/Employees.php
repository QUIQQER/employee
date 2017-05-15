<?php

/**
 * This file contains QUI\ERP\Employee\Employees
 */

namespace QUI\ERP\Employee;

use QUI;
use QUI\Utils\Singleton;

/**
 * Class Employees
 * - Main employee API
 *
 * @package QUI\ERP\Employee
 */
class Employees extends Singleton
{
    /**
     * @var null|QUI\Groups\Group
     */
    protected $Employees = null;

    /**
     * @var null|QUI\Interfaces\Users\User
     */
    protected $Advisor = null;

    /**
     * Return the employee group
     *
     * @return QUI\Groups\Group
     * @throws Exception
     */
    public function getEmployeeGroup()
    {
        if ($this->Employees !== null) {
            return $this->Employees;
        }

        $Package = QUI::getPackage('quiqqer/employee');
        $Config  = $Package->getConfig();
        $groupId = $Config->getValue('employee', 'groupId');

        if (empty($groupId)) {
            throw new Exception(array(
                'quiqqer/employee',
                'exception.employee.group.not.exists'
            ));
        }

        $this->Employees = QUI::getGroups()->get($groupId);

        return $this->Employees;
    }

    /**
     * Return the default advisor, if an advisor is set
     *
     * @return null|QUI\Interfaces\Users\User
     */
    public function getDefaultAdvisor()
    {
        if ($this->Advisor !== null) {
            return $this->Advisor ? $this->Advisor : null;
        }

        $Package   = QUI::getPackage('quiqqer/employee');
        $Config    = $Package->getConfig();
        $advisorId = $Config->getValue('employee', 'advisorId');

        if (empty($advisorId)) {
            $this->Advisor = false;
            return null;
        }

        try {
            $this->Advisor = QUI::getUsers()->get($advisorId);
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::addNotice($Exception->getMessage());
            $this->Advisor = false;
            return null;
        }

        return $this->Advisor;
    }
}
