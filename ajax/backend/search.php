<?php

/**
 * This file contains package_quiqqer_employee_ajax_backend_search
 */

/**
 * Execute the employee search
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_employee_ajax_backend_search',
    function ($params) {
        $params = \json_decode($params, true);
        $Search = new QUI\ERP\Employee\Search();

        if (isset($params['filter'])) {
            foreach ($params['filter'] as $filter => $value) {
                $Search->setFilter($filter, $value);
            }
        }

        if (isset($params['search'])) {
            $Search->setFilter('search', $params['search']);
        }

        if (isset($params['onlyEmployee']) && $params['onlyEmployee']) {
            $Search->searchOnlyInEmployee();
        } else {
            $Search->searchInAllGroups();
        }

        // limit
        $start = 0;
        $count = 50;

        if (isset($params['perPage'])) {
            $count = (int)$params['perPage'];
        }

        if (isset($params['page'])) {
            $start = ($params['page'] * $count) - $count;
        }

        $Search->limit($start, $count);

        // order / sort
        $sortOn = 'username';
        $sortBy = 'ASC';

        if (isset($params['sortOn'])) {
            $sortOn = $params['sortOn'];
        }

        if (isset($params['sortBy'])) {
            $sortBy = $params['sortBy'];
        }

        if (isset($params['sortOn'])) {
            $Search->order($sortOn.' '.$sortBy);
        }


        // exec
        return $Search->searchForGrid();
    },
    ['params'],
    'Permission::checkAdminUser'
);
