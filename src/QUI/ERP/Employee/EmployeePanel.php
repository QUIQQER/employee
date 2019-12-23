<?php

namespace QUI\ERP\Employee;

use QUI;
use QUI\Utils\Singleton;

/**
 * Class EmployeePanel
 *
 * @package QUI\ERP\Employee
 */
class EmployeePanel extends Singleton
{
    /**
     * @return array
     */
    public function getPanelCategories()
    {
        $cache = 'quiqqer/employee/panel/categories';

        try {
            $result = QUI\Cache\Manager::get($cache);
        } catch (QUI\Exception $Exception) {
            $files = [];

            $PackageHandler = QUI::getPackageManager();
            $packages       = $PackageHandler->getInstalled();

            foreach ($packages as $package) {
                try {
                    $Package = $PackageHandler->getInstalledPackage($package['name']);
                } catch (QUI\Exception $Exception) {
                    QUI\System\Log::addDebug($Exception->getMessage());
                    continue;
                }

                if (!$Package->isQuiqqerPackage()) {
                    continue;
                }

                $packageDir  = $Package->getDir();
                $employeeXml = $packageDir.'/employee.xml';

                if (\file_exists($employeeXml)) {
                    $files[] = $employeeXml;
                }
            }


            $Settings = QUI\Utils\XML\Settings::getInstance();
            $Settings->setXMLPath('//quiqqer/window');

            $result = $Settings->getPanel($files);

            $result['categories'] = $result['categories']->toArray();

            foreach ($result['categories'] as $key => $category) {
                $result['categories'][$key]['items'] = $result['categories'][$key]['items']->toArray();
            }

            QUI\Cache\Manager::set($cache, $result);
        }


        // category translation
        $categories           = $result['categories'];
        $result['categories'] = [];

        foreach ($categories as $key => $category) {
            if (isset($category['title']) && \is_array($category['title'])) {
                $category['text'] = QUI::getLocale()->get(
                    $category['title'][0],
                    $category['title'][1]
                );

                $category['title'] = QUI::getLocale()->get(
                    $category['title'][0],
                    $category['title'][1]
                );
            }

            if (empty($category['text']) && !empty($category['title'])) {
                $category['text'] = $category['title'];
            }

            $result['categories'][] = $category;
        }

        return $result;
    }

    /**
     * @param string $category
     * @return string
     */
    public function getPanelCategory($category)
    {
        $files = [];

        $PackageHandler = QUI::getPackageManager();
        $packages       = $PackageHandler->getInstalled();

        foreach ($packages as $package) {
            try {
                $Package = $PackageHandler->getInstalledPackage($package['name']);
            } catch (QUI\Exception $Exception) {
                QUI\System\Log::addDebug($Exception->getMessage());
                continue;
            }

            if (!$Package->isQuiqqerPackage()) {
                continue;
            }

            $packageDir  = $Package->getDir();
            $employeeXml = $packageDir.'/employee.xml';

            if (\file_exists($employeeXml)) {
                $files[] = $employeeXml;
            }
        }

        $Settings = QUI\Utils\XML\Settings::getInstance();
        $Settings->setXMLPath('//quiqqer/window');

        $result = $Settings->getCategoriesHtml($files, $category);

        return $result;
    }
}
