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
     * @param string $username
     * @param array $address
     * @param array $groupIds
     *
     * @return QUI\Users\User
     *
     * @throws QUI\Exception
     * @throws QUI\Permissions\Exception
     */
    public function createEmployee($username, $address = [], $groupIds = [])
    {
        QUI\Permissions\Permission::checkPermission('quiqqer.employee.create');

        $User = QUI::getUsers()->createChild($username);

        $User->setAttribute('mainGroup', $this->getEmployeeGroupId());
        $User->save();

        if (!empty($address)) {
            try {
                $Address = $User->getStandardAddress();
            } catch (QUI\Exception $Exception) {
                $Address = $User->addAddress();
            }

            $needles = [
                'salutation',
                'firstname',
                'lastname',
                'company',
                'delivery',
                'street_no',
                'zip',
                'city',
                'country'
            ];

            foreach ($needles as $needle) {
                if (!isset($address[$needle])) {
                    $address[$needle] = '';
                }
            }

            $Address->setAttribute('salutation', $address['salutation']);
            $Address->setAttribute('firstname', $address['firstname']);
            $Address->setAttribute('lastname', $address['lastname']);
            $Address->setAttribute('company', $address['company']);
            $Address->setAttribute('delivery', $address['delivery']);
            $Address->setAttribute('street_no', $address['street_no']);
            $Address->setAttribute('zip', $address['zip']);
            $Address->setAttribute('city', $address['city']);
            $Address->setAttribute('country', $address['country']);

            $Address->save();

            if (!$User->getAttribute('firstname') || $User->getAttribute('firstname') === '') {
                $User->setAttribute('firstname', $address['firstname']);
            }

            if (!$User->getAttribute('lastname') || $User->getAttribute('lastname') === '') {
                $User->setAttribute('lastname', $address['lastname']);
            }
        }

        // groups
        $this->addUserToEmployeeGroup($User->getId());

        foreach ($groupIds as $groupId) {
            $User->addToGroup($groupId);
        }

        $User->save();

        return $User;
    }

    /**
     * @return array|bool|string
     *
     * @throws Exception
     * @throws QUI\Exception
     */
    public function getEmployeeGroupId()
    {
        $Package = QUI::getPackage('quiqqer/employee');
        $Config  = $Package->getConfig();
        $groupId = $Config->getValue('employee', 'groupId');

        if (empty($groupId)) {
            throw new Exception([
                'quiqqer/employee',
                'exception.employee.group.not.exists'
            ]);
        }

        return $groupId;
    }

    /**
     * Return the employee group
     *
     * @return QUI\Groups\Group
     *
     * @throws Exception
     * @throws QUI\Exception
     */
    public function getEmployeeGroup()
    {
        if ($this->Employees === null) {
            $this->Employees = QUI::getGroups()->get($this->getEmployeeGroupId());
        }

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

        try {
            $Package   = QUI::getPackage('quiqqer/employee');
            $Config    = $Package->getConfig();
            $advisorId = $Config->getValue('employee', 'advisorId');
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::addError($Exception->getMessage());

            return null;
        }

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

    /**
     * Returns whether the employee can log in to the system or not
     *
     * @return bool
     */
    public function getEmployeeLoginFlag()
    {
        try {
            $Package = QUI::getPackage('quiqqer/employee');
            $Config  = $Package->getConfig();
        } catch (QUI\Exception $Exception) {
            return false;
        }

        return (bool)$Config->getValue('employee', 'employeeLogin');
    }

    /**
     * Add a user to the employee group
     *
     * @param {string|bool} $userId
     *
     * @throws QUI\Exception
     * @throws QUI\Users\Exception
     */
    public function addUserToEmployeeGroup($userId)
    {
        if (!$userId) {
            return;
        }

        $employeeGroup = null;

        try {
            $employeeGroup = $this->getEmployeeGroupId();
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::addError($Exception->getMessage());
        }

        if (!$employeeGroup) {
            return;
        }

        $User = QUI::getUsers()->get((int)$userId);

        if ($User->isInGroup($employeeGroup)) {
            return;
        }

        $User->addToGroup($employeeGroup);
        $User->save();
    }

    /**
     * Remove a user from the employee group
     *
     * @param {string|bool} $userId
     *
     * @throws QUI\Exception
     * @throws QUI\Users\Exception
     */
    public function removeUserFromEmployeeGroup($userId)
    {
        $employeeGroup = null;

        try {
            $employeeGroup = $this->getEmployeeGroupId();
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::addError($Exception->getMessage());
        }

        if (!$employeeGroup) {
            return;
        }

        $User = QUI::getUsers()->get((int)$userId);
        $User->removeGroup($employeeGroup);
        $User->save();
    }

    /**
     * @param $userId
     * @param array $attributes
     *
     * @throws QUI\Exception
     */
    public function setAttributesToEmployee($userId, array $attributes)
    {
        $User = QUI::getUsers()->get($userId);

        if (!empty($attributes['password1'])
            && !empty($attributes['password2'])
            && $attributes['password1'] === $attributes['password2']) {
            $User->setPassword($attributes['password1']);

            unset($attributes['password1']);
            unset($attributes['password2']);
        }

        // defaults
        $User->setAttributes($attributes);

        // address
        $this->saveAddress($User, $attributes);

        // group
        $groups = [];

        if (isset($attributes['group'])) {
            $groups[] = (int)$attributes['group'];
            $User->setAttribute('mainGroup', (int)$attributes['group']);
        } elseif (isset($attributes['group']) && $attributes['group'] === null) {
            $User->setAttribute('mainGroup', false);
        }

        if (isset($attributes['groups'])) {
            if (\strpos($attributes['groups'], ',') !== false) {
                $attributes['groups'] = \explode(',', $attributes['groups']);
            }

            $groups = \array_merge($groups, $attributes['groups']);
        }

        if (!empty($groups)) {
            $User->setGroups($groups);
        }

        if (!empty($attributes['address-firstname']) &&
            (!$User->getAttribute('firstname') || $User->getAttribute('firstname') === '')) {
            $User->setAttribute('firstname', $attributes['address-firstname']);
        }

        if (!empty($attributes['address-lastname']) &&
            (!$User->getAttribute('lastname') || $User->getAttribute('lastname') === '')) {
            $User->setAttribute('lastname', $attributes['address-lastname']);
        }

        $User->save();
    }

    /**
     * @param QUI\Users\User $User
     * @param array $attributes
     *
     * @throws QUI\Exception
     * @throws QUI\Permissions\Exception
     * @throws QUI\Users\Exception
     */
    protected function saveAddress(QUI\Users\User $User, $attributes)
    {
        try {
            $Address = $User->getStandardAddress();
        } catch (QUI\Exception $Exception) {
            // create one
            $Address = $User->addAddress([]);
        }

        $addressAttributes = [
            'salutation',
            'firstname',
            'lastname',
            'company',

            'street_no',
            'zip',
            'city',
            'country'
        ];

        foreach ($addressAttributes as $addressAttribute) {
            if (isset($attributes['address-'.$addressAttribute])) {
                $Address->setAttribute($addressAttribute, $attributes['address-'.$addressAttribute]);
                unset($attributes['address-'.$addressAttribute]);
            }
        }

        // tel, fax, mobile
        if (!empty($attributes['address-communication'])) {
            $Address->clearPhone();

            foreach ($attributes['address-communication'] as $entry) {
                if (isset($entry['no']) && isset($entry['type'])) {
                    $Address->addPhone($entry);
                }
            }
        }

        // mail
        if (!empty($attributes['address-mail'])) {
            $Address->clearMail();
            $Address->addMail($attributes['address-mail']);
            unset($attributes['address-mail']);
        }

        $Address->save();
    }


    //region comments

    /**
     * Add a comment to the employee user comments
     *
     * @param QUI\Users\User $User
     * @param string $comment - comment message
     *
     * @throws QUI\Exception
     */
    public function addCommentToUser(QUI\Users\User $User, $comment)
    {
        QUI\Permissions\Permission::checkPermission('quiqqer.employee.editComments');

        $Comments = $this->getUserComments($User);

        $Comments->addComment(
            $comment,
            false,
            'quiqqer/employee',
            'fa fa-user'
        );

        $User->setAttribute('comments', $Comments->serialize());
        $User->save();
    }

    /**
     * Edit a comment
     *
     * @param QUI\Users\User $User
     * @param $commentId - id of the comment
     * @param $commentSource - comment source
     * @param $message - new comment message
     *
     * @throws QUI\Exception
     */
    public function editComment(
        QUI\Users\User $User,
        $commentId,
        $commentSource,
        $message
    ) {
        QUI\Permissions\Permission::checkPermission('quiqqer.employee.editComments');

        $comments = $User->getAttribute('comments');
        $comments = \json_decode($comments, true);

        foreach ($comments as $key => $comment) {
            if (empty($comment['id']) || empty($comment['source'])) {
                continue;
            }

            if ($comment['source'] !== $commentSource) {
                continue;
            }

            if ($comment['id'] !== $commentId) {
                continue;
            }

            $comments[$key]['message'] = $message;
        }

        $User->setAttribute('comments', \json_encode($comments));
        $User->save();
    }

    /**
     * @param QUI\Users\User $User
     * @return QUI\ERP\Comments
     */
    public function getUserComments(QUI\Users\User $User)
    {
        $comments = $User->getAttribute('comments');
        $comments = \json_decode($comments, true);

        if ($comments) {
            $Comments = new QUI\ERP\Comments($comments);
        } else {
            $Comments = new QUI\ERP\Comments($comments);
        }

        return $Comments;
    }

    //endregion
}
