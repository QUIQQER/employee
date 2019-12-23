<?php

namespace QUI\ERP\Employee;

use QUI;
use QUI\Permissions\Permission;

/**
 * Class EmployeeFiles
 *
 * @package QUI\ERP\Employee
 */
class EmployeeFiles
{
    /**
     * @param QUI\Interfaces\Users\User $User
     * @throws QUI\Exception
     */
    public static function createFolder(QUI\Interfaces\Users\User $User)
    {
        if (!$User->getId()) {
            return;
        }

        $employeeDir = self::getFolderPath($User);

        if (empty($employeeDir)) {
            throw new QUI\Exception('Could not create employee folder');
        }

        if (!\is_dir($employeeDir)) {
            QUI\Utils\System\File::mkdir($employeeDir);
        }
    }

    /**
     * @param QUI\Interfaces\Users\User $User
     * @return string
     */
    public static function getFolderPath(QUI\Interfaces\Users\User $User)
    {
        try {
            $Package = QUI::getPackageManager()->getInstalledPackage('quiqqer/employee');
            $varDir  = $Package->getVarDir();
        } catch (QUI\Exception $Exception) {
            return '';
        }

        return $varDir.$User->getId();
    }

    /**
     * Return the file list from the employee
     *
     * @param $employeeId
     * @return array
     *
     * @throws QUI\Permissions\Exception
     */
    public static function getFileList($employeeId)
    {
        Permission::checkPermission('quiqqer.employee.fileView');

        try {
            $Employee = QUI::getUsers()->get($employeeId);

            self::createFolder($Employee);
        } catch (QUI\Exception $Exception) {
            return [];
        }

        $employeeDir = self::getFolderPath($Employee);
        $files       = QUI\Utils\System\File::readDir($employeeDir);
        $result      = [];

        foreach ($files as $file) {
            try {
                $info = QUI\Utils\System\File::getInfo(
                    $employeeDir.DIRECTORY_SEPARATOR.$file
                );
            } catch (\Exception $Exception) {
                $info = [
                    'basename'           => $file,
                    'filesize'           => '---',
                    'filesize_formatted' => '---',
                    'extension'          => ''
                ];
            }

            if ($info['filesize'] !== '---') {
                $info['filesize_formatted'] = QUI\Utils\System\File::formatSize($info['filesize']);
            }

            $info['icon'] = QUI\Projects\Media\Utils::getIconByExtension($info['extension']);

            $result[] = $info;
        }

        \usort($result, function ($a, $b) {
            return \strnatcmp($a['basename'], $b['basename']);
        });

        return $result;
    }

    /**
     * @param string|integer $employeeId
     * @param array $files
     *
     * @throws QUI\Permissions\Exception
     */
    public static function deleteFiles($employeeId, array $files = [])
    {
        Permission::checkPermission('quiqqer.employee.fileEdit');

        try {
            $Employee = QUI::getUsers()->get($employeeId);
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::addDebug($Exception->getMessage());

            return;
        }

        $employeeDir = self::getFolderPath($Employee);

        foreach ($files as $fileName) {
            $file = $employeeDir.DIRECTORY_SEPARATOR.$fileName;

            if (\file_exists($file)) {
                \unlink($file);
            }
        }
    }

    /**
     * Add a file to the employee
     *
     * @param $employeeId
     * @param $file
     *
     * @throws QUI\Exception
     * @throws QUI\Permissions\Exception
     */
    public static function addFileToEmployee($employeeId, $file)
    {
        Permission::checkPermission('quiqqer.employee.fileUpload');

        if (!\file_exists($file)) {
            throw new QUI\Exception('File not found', 404);
        }

        try {
            $Employee = QUI::getUsers()->get($employeeId);
            $fileInfo = QUI\Utils\System\File::getInfo($file);
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::addDebug($Exception->getMessage());

            return;
        }

        $employeeDir = self::getFolderPath($Employee);

        rename(
            $file,
            $employeeDir.DIRECTORY_SEPARATOR.$fileInfo['basename']
        );
    }
}
